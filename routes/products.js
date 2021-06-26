const { Product } = require("../models/product");
const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
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

// all request starts here

router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  let categoryArray = req.body.category.split(",");

  // multiple products get added  with diffrent category
  for (let item of categoryArray) {
    if (!mongoose.isValidObjectId(item)) {
      return res.status(400).send("Invalid Product category");
    }

    const category = await Category.findById(item);
    if (!category) return res.status(400).send("Invalid Category");

    const file = req.file;
    if (!file) return res.status(400).send("No image in the request");

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      image: `${basePath}${fileName}`,
      max_price: req.body.max_price,
      category: item,
      status: req.body.status,
      reassigned_to: req.body.reassigned_to,
    });

    product = await product.save();

    if (!product) return res.status(500).send("The product cannot be created");
  }

  res.send("products added sucessfully");
});

//admin will add product withouth category
router.post(`/admin`, uploadOptions.single("image"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No image in the request");

  const fileName = file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    image: `${basePath}${fileName}`,
    max_price: req.body.max_price,
    status: req.body.status,
    reassigned_to: req.body.reassigned_to,
  });

  product = await product.save();

  if (!product) return res.status(500).send("The product cannot be created");

  res.send("products added sucessfully");
});

//get products, also get by category
router.get(`/`, async (req, res) => {
  // localhost:3000/api/v1/products?categories=2342342,234234
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  console.log(filter);
  const productList = await Product.find(filter).populate("category");

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

// get by category and show details
router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

router.put("/:id", uploadOptions.single("image"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Product Id");
  }
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(400).send("Invalid Product!");

  const file = req.file;
  let imagepath;

  if (file) {
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    imagepath = `${basePath}${fileName}`;
  } else {
    imagepath = product.image;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      image: imagepath,
      max_price: req.body.max_price,
      category: req.body.category,
      status: req.body.status,
      reassigned_to: req.body.reassigned_to,
    },
    { new: true }
  );

  if (!updatedProduct)
    return res.status(500).send("the product cannot be updated!");

  res.send(updatedProduct);
});

// Appove pending products
router.put("/product-approval/:id", async (req, res) => {
  console.log("req.body.productId", req.params.id);
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Product Id");
  }

  if (!req.body.max_price)
    return res.status(400).send("Max Price of product is required!");

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(400).send("Invalid Product!");

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: product.name,
      description: product.description,
      image: product.image,
      max_price: req.body.max_price,
      category: product.category,
      status: "Approved",
      reassigned_to: product.reassigned_to,
    },
    { new: true }
  );

  if (!updatedProduct)
    return res.status(500).send("the product cannot be updated!");

  res.send(updatedProduct);
});

// Reject pending products
router.put("/product-rejection/:id", async (req, res) => {
  console.log("req.body.productId", req.params.id);
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Product Id");
  }

  if (!req.body.rejection_reason)
    return res.status(400).send("Reason for Rejection is required!");

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(400).send("Invalid Product!");

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: product.name,
      description: product.description,
      image: product.image,
      max_price: product.max_price,
      category: product.category,
      status: "Rejected",
      rejection_reason: req.body.rejection_reason,
    },
    { new: true }
  );

  if (!updatedProduct)
    return res.status(500).send("the product cannot be updated!");

  res.send(updatedProduct);
});

router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "the product is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "product not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

// Reassign product if similar already exist
router.put("/product-reassign/:id", async (req, res) => {
  console.log("req.body.productId", req.params.id);
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Product Id");
  }

  if (!req.body.existingProductId)
    return res.status(400).send("Product which will be assigned is required!");
  if (!mongoose.isValidObjectId(req.body.existingProductId)) {
    return res.status(400).send("Product which will be assigned is invalid");
  }

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(400).send("Invalid Product!");

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: product.name,
      description: product.description,
      image: product.image,
      max_price: product.max_price,
      category: product.category,
      status: "Reassigned",
      reassigned_to: req.body.existingProductId,
    },
    { new: true }
  );

  if (!updatedProduct)
    return res.status(500).send("the product cannot be updated!");

  res.send(updatedProduct);
});

// get approved products, also by category
router.get(`/get/approved`, async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    if (!mongoose.isValidObjectId(req.query.categories))
      return res.status(400).send("Invalid Category Id");

    filter = {
      $and: [
        { category: req.query.categories.split(",") },
        { status: "Approved" },
      ],
    };
  } else {
    filter = { status: "Approved" };
  }
  console.log(filter);
  const productList = await Product.find(filter).populate("category");

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

// get pending products, also by category
router.get(`/get/pending`, async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    if (!mongoose.isValidObjectId(req.query.categories))
      return res.status(400).send("Invalid Category Id");

    filter = {
      $and: [
        { category: req.query.categories.split(",") },
        { status: "Pending" },
      ],
    };
  } else {
    filter = { status: "Pending" };
  }
  console.log(filter);
  const productList = await Product.find(filter).populate("category");

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments((count) => count);

  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    productCount: productCount,
  });
});

router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "the product is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "product not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

module.exports = router;
