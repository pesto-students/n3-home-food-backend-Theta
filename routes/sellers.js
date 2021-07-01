const { Seller } = require("../models/seller");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validateTokenAdmin = require("../config/jwt");
const secret = process.env.SELLER_SECRET;
const { Product } = require("../models/product");
const mongoose = require("mongoose");
const { Order } = require("../models/order");

// image upload configuration

const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");

    if (isValid) {
      uploadError = null;
    }
    // callback is the place to where we need to throw errors
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

// login a seller
router.post("/login", async (req, res) => {
  const seller = await Seller.findOne({ phone: req.body.phone });
  if (!seller) return res.status(400).send("No Seller Found");

  if (req.body.phone === seller.phone && seller.status == "Approved") {
    const token = jwt.sign(
      {
        userId: seller.id,
        customerType: seller.customerType,
      },
      secret,
      { expiresIn: "1w" }
    );

    res.status(200).json({
      success: true,
      token: token,
      userType: seller.customerType,
      id: seller.id,
    });
  } else {
    res
      .status(400)
      .send("Invalid phone or you dont have access to seller panel");
  }
});

// get sellers
// get all
router.get(`/`, async (req, res) => {
  const sellerList = await Seller.find().populate("products");
  if (!sellerList) {
    res.status(500).json({ success: false });
  }

  // get only rated sellers array

  for (let item of sellerList) {
    const OrderList = await Order.aggregate([
      { $match: { sellerDetails: new mongoose.Types.ObjectId(item.id) } },
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
          avgRating: { $divide: ["$totalPrice", 5] },
        },
      },
    ]);


    console.log(OrderList.length)
    if (OrderList.length) {
      item.rating = OrderList[0].avgRating;
    }
  }

  res.send(sellerList);
});

// get sellers by id
router.get(`/:id`, async (req, res) => {
  const seller = await Seller.findById(req.params.id).populate("category");

  if (!seller) {
    res.status(500).json({ success: false });
  }

  // get seller rating
  const OrderList = await Order.aggregate([
    { $match: { sellerDetails: new mongoose.Types.ObjectId(req.params.id) } },
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
        avgRating: { $divide: ["$totalPrice", 5] },
      },
    },
  ]);

  if (!OrderList) {
    res.status(500).json({ success: false });
  }
  if(OrderList.length){
    seller.rating = OrderList[0].avgRating;
  }

  res.send(seller);
});




// get sellers by pincode
router.get(`/pincode/:pincode`, async (req, res) => {
  let pincodeCheck = req.params.pincode
  let pincodeLower = Number(pincodeCheck) - 20
  let pincodeHigher = Number(pincodeCheck) + 20
  console.log(pincodeLower ,pincodeHigher)
  let filter = {"pincode":{$gt: pincodeLower, $lt: pincodeHigher}}
  const seller = await Seller.find(filter).populate("category");

  for (let item of seller) {
    const OrderList = await Order.aggregate([
      { $match: { sellerDetails: new mongoose.Types.ObjectId(item.id) } },
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
          avgRating: { $divide: ["$totalPrice", 5] },
        },
      },
    ]);

    if (OrderList.length) {
      item.rating = OrderList[0].avgRating;
    }
    console.log(OrderList);
  }

  if (!seller) {
    res.status(500).json({ success: false });
  }
  res.send(seller);
});

// get pending
router.get(`/get/pending`, async (req, res) => {
  const sellerList = await Seller.find({ status: "Pending" }).populate(
    "products"
  );
  if (!sellerList) {
    res.status(500).json({ success: false });
  }
  res.send(sellerList);
});

// get approved sellers
router.get(`/get/approved`, async (req, res) => {
  const sellerList = await Seller.find({ status: "Approved" }).populate(
    "products"
  );
  if (!sellerList) {
    res.status(500).json({ success: false });
  }
  res.send(sellerList);
});

// get rejected sellers
router.get(`/get/rejected`, async (req, res) => {
  const sellerList = await Seller.find({ status: "Rejected" }).populate(
    "products"
  );
  if (!sellerList) {
    res.status(500).json({ success: false });
  }
  res.send(sellerList);
});

// get products by sellerid
router.get(`/get/getproducts`, async (req, res) => {
  console.log("filter", req);
  let filter = mongoose.Types.ObjectId(req.query.sellerid);

  // const sellerList = await Seller.aggregate([
  //   { $match: { _id: filter } },
  //   // {$match:{'name':'sahil'}},
  //   {
  //     $lookup: {
  //       from: "products",
  //       localField: "products",
  //       foreignField: "_id",
  //       as: "productdetails",
  //     },
  //   },
  //   { $project : { "status": 1 ,"name":1, "myProducts":1,"description":1,"max_amount":1,"rating":1} }
  // ])

  const sellerList = await Seller.find({ _id: filter })
    .populate({ path: "myProducts", populate: "productCategory" })
    .select({
      status: 1,
      name: 1,
      myProducts: 1,
      description: 1,
      max_amount: 1,
      rating: 1,
    });

  // get seller rating
  const OrderList = await Order.aggregate([
    {
      $match: {
        sellerDetails: new mongoose.Types.ObjectId(sellerList[0]._id),
      },
    },
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
        avgRating: { $divide: ["$totalPrice", 5] },
      },
    },
  ]);


  if (!sellerList) {
    res.status(500).json({ success: false });
  }

  if (OrderList.length) {
    sellerList[0].rating = OrderList[0].avgRating;
  }

  res.send(sellerList);
});

// get products of sellers by category
router.get(`/get/products-category-wise`, async (req, res) => {
  console.log("filter", req);
  let filter = mongoose.Types.ObjectId(req.query.sellerid);

  const sellerList = await Seller.aggregate([
    // { $match: {$and:[{ _id: filter },{myProducts.category :"60c906ce35453e14cd3f4ee3"} ]}},
    { $match: { _id: filter } },
    // {$match:{'name':'sahil'}},
    {
      $lookup: {
        from: "products",
        localField: "products",
        foreignField: "_id",
        as: "productdetails",
      },
    },
  ]);
  console.log(sellerList);
  if (!sellerList) {
    res.status(500).json({ success: false });
  }
  res.send(sellerList);
});

// get sellers from product id
router.get(`/get/SellersByProducts`, async (req, res) => {
  let filter = req.query.productid;
  const sellerList = await Seller.find({
    products: { $in: [mongoose.Types.ObjectId(req.query.productid)] },
  });
  if (!sellerList) {
    res.status(500).json({ success: false });
  }
  res.send(sellerList);
});

// //get sellers from category
router.get(`/get/SellersByCategory`, async (req, res) => {
  console.log("asda");
  const sellerList = await Seller.find({
    productCategories: { $in: [req.query.categoryId] },
  });

  if (!sellerList) {
    res.status(500).json({ success: false });
  }
  res.send(sellerList);
});

router.post("/register", async (req, res) => {
  console.log("res", res);
  let seller = new Seller({
    name: req.body.name,
    email: req.body.email,
    image: req.body.image,
    phone: req.body.phone,
    adress: req.body.adress,
    idProof: req.body.idProof,
    description: req.body.description,
    pincode: req.body.pincode,
    display_name: req.body.display_name

  });
  seller = await seller.save();

  if (!seller) return res.status(400).send("the seller cannot be created!");

  res.send(seller);
});

router.post("/login", async (req, res) => {
  console.log(req.body.email);
  const seller = await Seller.findOne({ email: req.body.email });
  if (!seller) return res.status(400).send("No User Found");

  if (bcrypt.compareSync(req.body.password, seller.passwordHash)) {
    const token = jwt.sign(
      {
        userId: seller.id,
        isSeller: seller.isSeller,
      },
      secret,
      { expiresIn: "1w" }
    );

    res.status(200).json({ success: true, token: token });
  } else {
    res.status(400).send("Invalid Password");
  }
});

// updating of seller

// add products to seller and also update category

router.put("/:id", async (req, res) => {
  const userExist = await Seller.findById(req.params.id);
  const product = await Product.findById(req.body.products[0]);
  let productsArray = [];
  let categoryArray = [];
  productsArray = [...userExist.products];
  productsArray = productsArray.concat(req.body.products);
  categoryArray = userExist.productCategories;

  // create a my products
  const myProduct = {
    productId: product.id,
    quantity: 0,
    price: 0,
    productCategory: req.body.category,
    name: product.name,
    description: product.description,
    image: product.image,
  };

  userExist.myProducts.push(myProduct);
  console.log("product", userExist.myProducts);
  // check if the exist product array has cateogry of the new product we are adding
  for (let item of req.body.category) {
    if (!categoryArray.includes(item)) {
      categoryArray.push(item);
    }
  }

  const user = await Seller.findByIdAndUpdate(
    req.params.id,
    {
      name: userExist.name,
      email: userExist.email,
      phone: userExist.phone,
      image: userExist.image,
      customerType: userExist.customerType,
      adress: userExist.adress,
      idProof: userExist.idProof,
      products: productsArray,
      myProducts: userExist.myProducts,
      productCategories: categoryArray,
      requestedProducts: userExist.requestedProducts,
      status: "Approved",
      rejection_reason: userExist.rejection_reason,
      description: userExist.description,
      pincode: userExist.pincode,
      rating:userExist.rating

    },
    { new: true }
  );

  if (!user) return res.status(400).send("the product cannot be added!");

  res.send(user);
});

// seller will update the quantity or price of my products
router.put("/update-product-quantitiy/:id", async (req, res) => {
  const userExist = await Seller.findById(req.params.id);

  // userExist.myProducts.push(myProduct);
  let max_price_seller = 0;

  let myProductsArray = userExist.myProducts;
  for (let item of myProductsArray) {
    if (req.body.productid.toString() === item.productId.toString()) {
      // we got our product to be edited, now edit it

      (item.quantity = req.body.product_quantity),
        (item.price = req.body.product_price),
        (item.productCategory = req.body.category);
    }
  }

  
  const user = await Seller.findByIdAndUpdate(
    // add products to seller and also update category

    req.params.id,
    {
      name: userExist.name,
      email: userExist.email,
      phone: userExist.phone,
      image: userExist.image,
      customerType: userExist.customerType,
      adress: userExist.adress,
      idProof: userExist.idProof,
      products: userExist.products,
      myProducts: myProductsArray,
      productCategories: userExist.productCategories,
      requestedProducts: userExist.requestedProducts,
      status: "Approved",
      rejection_reason: userExist.rejection_reason,
      max_amount: max_price_seller,
      rating: userExist.rating,
      description: userExist.description,
      pincode: userExist.pincode,
      rating:userExist.rating


    },
    { new: true }
  );

  if (!user) return res.status(400).send("the product cannot be added!");

  res.send(user);
});

// Approve a seller
router.put("/approve/:id", async (req, res) => {
  const seller = await Seller.findById(req.params.id);
  if (!seller) {
    res.status(500).json({ success: false });
  }

  const updatedSeller = await Seller.findByIdAndUpdate(
    req.params.id,
    {
      name: seller.name,
      email: seller.email,
      phone: seller.phone,
      image: seller.image,
      customerType: seller.customerType,
      adress: seller.adress,
      idProof: seller.idProof,
      products: seller.products,
      productCategories: seller.productCategories,
      requestedProducts: seller.requestedProducts,
      status: "Approved",
      rejection_reason: seller.rejection_reason,
      description: seller.description,
      pincode: seller.pincode,
      rating:seller.rating


    },
    { new: true }
  );

  if (!updatedSeller)
    return res.status(400).send("the user cannot be created!");

  res.send(updatedSeller);
});

// Reject a seller
router.put("/reject/:id", async (req, res) => {
  const seller = await Seller.findById(req.params.id);
  if (!seller) {
    res.status(500).json({ success: false });
  }

  const updatedSeller = await Seller.findByIdAndUpdate(
    req.params.id,
    {
      name: seller.name,
      email: seller.email,
      passwordHash: seller.passwordHash,
      phone: seller.phone,
      image: seller.image,
      customerType: seller.customerType,
      adress: seller.adress,
      idProof: seller.idProof,
      products: seller.products,
      productCategories: seller.productCategories,
      requestedProducts: seller.requestedProducts,
      status: "Rejected",
      rejection_reason: req.body.rejection_reason,
      description: seller.description,
      pincode: seller.pincode,
      rating:seller.rating


    },
    { new: true }
  );

  if (!updatedSeller)
    return res.status(400).send("the user cannot be created!");

  res.send(updatedSeller);
});

router.delete("/:id", (req, res) => {
  Seller.findByIdAndRemove(req.params.id)
    .then((seller) => {
      if (seller) {
        return res
          .status(200)
          .json({ success: true, message: "the seller is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "seller not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

// edit a seller
router.put("/edit/:id", async (req, res) => {
  const seller = await Seller.findById(req.params.id);
  if (!seller) {
    return res.status(500).json({ success: false });
  }

  console.log(seller, req.body);

  const updatedSeller = await Seller.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      phone: req.body.phone,
      image: seller.image,
      customerType: seller.customerType,
      adress: req.body.adress,
      idProof: seller.idProof,
      products: seller.products,
      myProducts: seller.myProducts,
      productCategories: seller.productCategories,
      requestedProducts: seller.requestedProducts,
      status: "Approved",
      rejection_reason: seller.rejection_reason,
      description: seller.description,
      rating:seller.rating,
      pincode:req.body.pincode


    },
    { new: true }
  );

  console.log(updatedSeller)
  if (!updatedSeller)
    return res.status(400).send("the user cannot be created!");

  res.send(updatedSeller);
});

// delete a product id from seller
router.put("/delete-product/:id", async (req, res) => {
  const seller = await Seller.findById(req.params.id);
  if (!seller) {
    res.status(500).json({ success: false });
  }

  seller.myProducts = seller.myProducts.filter(
    (element) => element._id.toString() !== req.body.productId
  );
  console.log(seller.myProducts);
  const updatedSeller = await Seller.findByIdAndUpdate(
    req.params.id,
    {
      name: seller.name,
      email: seller.email,
      phone: seller.phone,
      image: seller.image,
      customerType: seller.customerType,
      adress: seller.adress,
      idProof: seller.idProof,
      products: seller.products,
      myProducts: seller.myProducts,
      productCategories: seller.productCategories,
      requestedProducts: seller.requestedProducts,
      status: "Approved",
      rejection_reason: seller.rejection_reason,
      description: seller.description,
      pincode: seller.pincode,
      rating:seller.rating
    },
    { new: true }
  );

  if (!updatedSeller)
    return res.status(400).send("the user cannot be created!");

  res.send(updatedSeller);
});

module.exports = router;
