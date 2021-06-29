const { Seller } = require("../models/seller");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validateTokenAdmin = require("../config/jwt");
const secret = process.env.SELLER_SECRET;
const { Product } = require("../models/product");
const mongoose = require("mongoose");

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


// get sellers
// get all
router.get(`/`, async (req, res) => {
  const sellerList = await Seller.find().populate("products");
  if (!sellerList) {
    res.status(500).json({ success: false });
  }
  res.send(sellerList);
});

// get sellers by id
router.get(`/:id`, async (req, res) => {
  const seller = await Seller.findById(req.params.id).populate("category");

  if (!seller) {
    res.status(500).json({ success: false });
  }
  res.send(seller);
});



// get pending
router.get(`/get/pending`, async (req, res) => {
  const sellerList = await Seller.find({status:'Pending'}).populate("products");
  if (!sellerList) {
    res.status(500).json({ success: false });
  }
  res.send(sellerList);
});

// get approved sellers
router.get(`/get/approved`, async (req, res) => {
  const sellerList = await Seller.find({status:'Approved'}).populate("products");
  if (!sellerList) {
    res.status(500).json({ success: false });
  }
  res.send(sellerList);
});

// get rejected sellers
router.get(`/get/rejected`, async (req, res) => {
  const sellerList = await Seller.find({status:'Rejected'}).populate("products");
  if (!sellerList) {
    res.status(500).json({ success: false });
  }
  res.send(sellerList);
});

// get products by sellerid
router.get(`/getproducts`, async (req, res) => {
  let filter = mongoose.Types.ObjectId(req.query.sellerid);
  const sellerList = await Seller.aggregate([
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
router.get(`/getSellersByProducts`, async (req, res) => {
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
 router.get(`/getSellersByCategory`, async (req, res) => {
  

  const sellerList = await Seller.find({productCategories :{$in : [req.query.categoryId]}});

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
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    adress: req.body.adress,
    idProof: req.body.idProof,
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
  let productsArray = [];
  let categoryArray = [];
  productsArray = [...userExist.products];
  productsArray = productsArray.concat(req.body.products);
  categoryArray = userExist.productCategories;

    for (let element of req.body.products) {
      const product = await Product.findById(element);
      categoryArray.includes(product.category)
      if (product && !categoryArray.includes(product.category)) {
        categoryArray.push(product.category);
      }
  }

    const user = await Seller.findByIdAndUpdate(
      req.params.id,
      {
        name: userExist.name,
        email: userExist.email,
        passwordHash: userExist.passwordHash,
        phone: userExist.phone,
        isSeller: userExist.isSeller,
        adress: userExist.adress,
        idProof: userExist.idProof,
        products: productsArray,
        productCategories:categoryArray
      },
      { new: true }
    );

    if (!user) return res.status(400).send("the user cannot be created!");

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
        passwordHash: seller.passwordHash,
        phone: seller.phone,
        image: seller.image,
        customerType: seller.customerType,
        adress: seller.adress,
        idProof: seller.idProof,
        products: seller.products,
        productCategories: seller.productCategories,
        requestedProducts: seller.requestedProducts,
        status: 'Approved',
        rejection_reason: seller.rejection_reason,
      },
      { new: true }
    );

    if (!updatedSeller) return res.status(400).send("the user cannot be created!");

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
        status: 'Rejected',
        rejection_reason: req.body.rejection_reason,
      },
      { new: true }
    );

    if (!updatedSeller) return res.status(400).send("the user cannot be created!");

    res.send(updatedSeller);
});


module.exports = router;
