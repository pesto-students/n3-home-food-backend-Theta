const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const shortid = require("shortid");
const bodyParser = require("body-parser");
const { send } = require("process");
const { User } = require("../models/user");
const { Cart } = require("../models/cart");

const razorpay = new Razorpay({
  key_id: "rzp_test_d0CoHtYXgWcl5z",
  key_secret: "Izq2IYhZ8WgtyjIXtX66D6i6",
});

router.post("/", async (req, res) => {
  const user = await User.findById(req.body.userId);
  if (!user) return res.status(400).send("No user found");

  if (!user.cart) return res.status(400).send("No user found");

  // if cart already exist

  const cart = await Cart.findById(user.cart);

  const payment_capture = 1;
  const amount = cart.subTotal;
  const currency = "INR";

  const options = {
    amount: amount * 100,
    currency,
    receipt: shortid.generate(),
    payment_capture,
  };

  try {
    const response = await razorpay.orders.create(options);
    console.log(response);
    res.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/verification", async (req, res) => {
  const secret = "Izq2IYhZ8WgtyjIXtX66D6i6";

  const crypto = require("crypto");
  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  console.log(digest, req.body.response.razorpay_signature);
  if (digest === req.razorpay_signature) {
    console.log("req is legit");
    // save this to database
  } else {
  }

  console.log(req.body);
  res.json({ status: "ok" });
});

module.exports = router;
