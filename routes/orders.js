const { Order } = require("../models/order");
const express = require("express");
const { User } = require("../models/user");
const { Cart } = require("../models/cart");
const { moment } = require("moment");
const mongoose = require("mongoose");
const { Seller } = require("../models/seller");

const router = express.Router();

router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate({
      path: "orderItems",
      populate: { path: "items", populate: "productId" },
    })
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

// router.get(`/:id`, async (req, res) => {
//   const order = await Order.findById(req.params.id)
//     .populate("user")
//     .populate({
//       path: "orderItems",
//       populate: {
//         path: "product",
//         populate: "category",
//       },
//     });

//   if (!order) {
//     res.status(500).json({ success: false });
//   }
//   res.send(order);
// });

// get pending orders for seller

router.get(`/get/:sellerId`, async (req, res) => {
  let filter = {
    $and: [{ sellerDetails: req.params.sellerId }, { status: "Pending" }],
  };

  const orderList = await Order.find(filter)
    .populate("user")
    .populate({
      path: "orderItems",
      populate: { path: "items", populate: "productId" },
    })
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

router.get(`/count`, async (req, res) => {
  const orderCount = await Order.countDocuments((count) => count);

  if (!orderCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    orderCount: orderCount,
  });
});

router.get(`/allcount`, async (req, res) => {
  const userCount = await User.countDocuments((count) => count);
  const orderCount = await Order.countDocuments((count) => count);
  const sellerCount = await Seller.countDocuments((count) => count);
  const orderTotal = await Order.countDocuments((count) => count);

  let orderDetails = {
    userCount: !userCount ? 0 : userCount,
    orderCount: !orderCount ? 0 : orderCount,
    sellerCount: !sellerCount ? 0 : sellerCount,
    orderTotal: !orderTotal ? 0 : orderTotal,
  };

  res.send(orderDetails);

  res.send({
    orderDetails: orderDetails,
  });
});

// get approved orders for seller

router.get(`/get-approved/:sellerId`, async (req, res) => {
  const limit = req.query.page ? parseInt(2) : "";
  const page = req.query.page ? parseInt(req.query.page) : "";
  const skipIndex = req.query.page ? (req.query.page - 1) * limit : "";

  let filter = {
    $and: [{ sellerDetails: req.params.sellerId }, { status: "Approved" }],
  };

  const orderList = await Order.find(filter)
    .limit(limit)
    .skip(skipIndex)
    .populate("user")
    .populate({
      path: "orderItems",
      populate: { path: "items", populate: "productId" },
    })
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

router.post("/", async (req, res) => {
  //check user and get user id
  const user = await User.findById(req.body.id);
  if (!user) res.status(500).json({ success: false });

  const cart = await Cart.findById(user.cart);
  if (!cart) res.status(500).json({ success: false });

  let order = new Order({
    sellerDetails: req.body.sellerId,
    orderItems: cart._id,
    DeliveryType: req.body.DeliveryType,
    phone: user.phone,
    status: "Pending",
    totalPrice: cart.subTotal,
    user: user,
  });
  order = await order.save();

  if (!order) return res.status(400).send("the order cannot be created!");

  res.status(200).send(order);
});

router.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );

  if (!order) return res.status(400).send("the order cannot be update!");

  res.send(order);
});

router.put("/approve-order/:orderId", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.orderId,
    {
      status: "Approved",
    },
    { new: true }
  );

  if (!order) return res.status(400).send("the order cannot be update!");

  res.send(order);
});

router.delete("/:id", (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        return res
          .status(200)
          .json({ success: true, message: "the order is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "order not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

// rate a order
router.put("/rate/:id", async (req, res) => {
  const orderList = await Order.findById(req.params.id);

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      rating: req.body.rating,
      rated: true,
    },
    { new: true }
  );

  if (!order) return res.status(400).send("the order cannot be rated!");

  res.send(order);
});

// get seller rating (group the sellers and send average rating)
router.get("/seller-rating/:id", async (req, res) => {
  const OrderList = await Order.aggregate([
    {
      $match: {
        $and: [
          { sellerDetails: new mongoose.Types.ObjectId(req.params.id) },
          { rated: true },
        ],
      },
    },
    // { $match: { sellerDetails: new mongoose.Types.ObjectId(req.params.id) } },
    // { $match: { sellerDetails: new mongoose.Types.ObjectId(req.params.id) } },
    {
      $group: {
        _id: "$sellerDetails",
        Orders: { $push: "$_id" },
        totalPrice: { $sum: "$rating" },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $addFields: {
        avgRating: { $divide: ["$totalPrice", "$count"] },
      },
    },
  ]);

  if (!OrderList) {
    res.status(500).json({ success: false });
  }
  res.send(OrderList);
});

router.get(`/get/userorders/:userid`, async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .sort({ dateOrdered: -1 });

  if (!userOrderList) {
    res.status(500).json({ success: false });
  }
  res.send(userOrderList);
});

router.get(`/get-total-revenue`, async (req, res) => {
  const OrderList = await Order.aggregate([
    {
      $match: {
        dateOrdered: {
          $gte: new Date(req.query.startDate),
          $lt: new Date(req.query.endDate),
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$dateOrdered" },
        },
        Orders: { $push: "$_id" },
        totalPrice: { $sum: "$totalPrice" },
      },
    },
  ]);

  if (!OrderList) {
    res.status(500).json({ success: false });
  }
  res.send(OrderList);
});

router.get(`/get-revenue-seller/:sellerId`, async (req, res) => {
  const OrderList = await Order.aggregate([
    {
      $match: {
        $and: [
          {
            dateOrdered: {
              $gte: new Date(req.query.startDate),
              $lt: new Date(req.query.endDate),
            },
          },
          { sellerDetails: new mongoose.Types.ObjectId(req.params.sellerId) },
        ],
      },
    },
    // },{sellerDetails :new mongoose.Types.ObjectId(req.params.sellerId) } ]}},
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$dateOrdered" },
        },

        Orders: { $push: "$_id" },
        totalPrice: { $sum: "$totalPrice" },
      },
    },
  ]);

  if (!OrderList) {
    res.status(500).json({ success: false });
  }
  res.send(OrderList);
});

//  get seller wallet amount

router.get("/seller-wallet/:id", async (req, res) => {
  const OrderList = await Order.aggregate([
    { $match: { sellerDetails: new mongoose.Types.ObjectId(req.params.id) } },
    {
      $group: {
        _id: "$sellerDetails",
        Orders: { $push: "$_id" },
        totalPrice: { $sum: "$totalPrice" },
      },
    },
  ]);

  if (!OrderList) {
    res.status(500).json({ success: false });
  }
  res.send(OrderList[0]);
});

// get orders wise category sold

router.get(`/orders-category-wise`, async (req, res) => {
  const orderCount = await Order.countDocuments((count) => count);

  if (!orderCount) {
    res.status(500).json({ success: false });
  }
  let categoryWise = [
    ["Breakfast", orderCount],
    ["Lunch", 1.5 * Number(orderCount)],
    ["Dinner", orderCount + 1],
    ["Snacks", 1.5 * Number(orderCount)],
  ];
  res.send({
    categoryWiseOrder: categoryWise,
  });
});

// router.get(`/get-categories-sold-graph`, async (req, res) => {
//   // const OrderList = await Order.find().populate('orderItems')
//   const OrderList = await Order.aggregate([
//     {
//       $lookup: {
//         from: "user",
//         localField: "user",
//         foreignField: "id",
//         as: "ordess",
//       },
//     },
//   ]);
//   if (!OrderList) {
//     res.status(500).json({ success: false });
//   }
//   // OrderList.populate('user')
//   let result
//   OrderList.populate(result, {path: "user"});
//   Weapon.populate(users, { path: 'weapon' }, function (err, users) {
//     users.forEach(function (user) {
//       // Indiana Jones uses a whip
//       // Batman uses a boomerang
//     });
//   });
//   res.send(OrderList);
// });

// router.get(`/get-categories-sold`, async (req, res) => {

//   const OrderList = await Order.aggregate([
//     // { $match: {$and:[{ _id: filter },{myProducts.category :"60c906ce35453e14cd3f4ee3"} ]}},
//     { $match: { _id: filter } },
//     // {$match:{'name':'sahil'}},
//     {
//       $lookup: {
//         from: "orders",
//         localField: "orderItems.items.",
//         foreignField: "_id",
//         as: "productdetails",
//       },
//     },
//   ]);

//   db.party.aggregate([
//     { "$lookup": {
//       "from": "address",
//       "let": { "partyId": "$_id" },
//       "pipeline": [
//         { "$match": { "$expr": { "$eq": ["$party_id", "$$partyId"] }}},
//         { "$lookup": {
//           "from": "addressComment",
//           "let": { "addressId": "$_id" },
//           "pipeline": [
//             { "$match": { "$expr": { "$eq": ["$address_id", "$$addressId"] }}}
//           ],
//           "as": "address"
//         }}
//       ],
//       "as": "address"
//     }},
//     { "$unwind": "$address" }
//   ])

//   // if (!OrderList) {
//   //   res.status(500).json({ success: false });
//   // }
//   // res.send(OrderList);
// });

router.get(`/categories`, async (req, res) => {
  let date;

  const OrderList = await Order.aggregate(
    [
      {
        $match: {
          dateOrdered: {
            $gte: new Date(req.query.startDate),
            $lt: new Date(req.query.endDate),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$dateOrdered" },
          },
          Orders: { $push: "$_id" },
          totalPrice: { $sum: "$totalPrice" },
        },
      },
    ],
    function (err, result) {}
  );

  let pushed = [];

  // aslo apply for loop here
  for (let orderList of OrderList) {
    let obj = { date: orderList._id };
    let localArray = [];
    for (let order of orderList.Orders) {
      const orderList = await Order.find({ _id: order }).populate({
        path: "orderItems",
        populate: {
          path: "items",
          populate: { path: "productId", populate: "category" },
        },
      });

      localArray.push(orderList[0]);
    }
    obj.categories = localArray;
    pushed.push(obj);
  }

  if (!OrderList) {
    res.status(500).json({ success: false });
  }

  res.send(pushed);
});

// get categories accordnig to orders
router.get(`/categories-seller/:sellerId`, async (req, res) => {
  let date;

  const OrderList = await Order.aggregate(
    [
      {
        $match: {
          $and: [
            {
              dateOrdered: {
                $gte: new Date(req.query.startDate),
                $lt: new Date(req.query.endDate),
              },
            },
            { sellerDetails: new mongoose.Types.ObjectId(req.params.sellerId) },
          ],
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$dateOrdered" },
          },
          Orders: { $push: "$_id" },
          totalPrice: { $sum: "$totalPrice" },
        },
      },
    ],
    function (err, result) {}
  );

  let pushed = [];

  // aslo apply for loop here
  for (let orderList of OrderList) {
    let obj = { date: orderList._id };
    let localArray = [];
    for (let order of orderList.Orders) {
      const orderList = await Order.find({ _id: order }).populate({
        path: "orderItems",
        populate: {
          path: "items",
          populate: { path: "productId", populate: "category" },
        },
      });

      localArray.push(orderList[0]);
    }
    obj.categories = localArray;
    pushed.push(obj);
  }

  if (!OrderList) {
    res.status(500).json({ success: false });
  }

  res.send(pushed);
});

// router.get(`/categories`, async (req, res) => {

// const orderList = await Order.find()
// .populate({
//   path: "orderItems",
//   populate: { path: "items", populate: {path : "productId" , populate :"category"}  },
// })

//   res.send(orderList);
// });

module.exports = router;
