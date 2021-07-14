const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const shortid = require("shortid");
const bodyParser = require("body-parser");
const { send } = require("process");
const { User } = require("../models/user");
const { Cart } = require("../models/cart");

const encryption_type = 'sha256' 
const key_id = process.env.RAZORPAY_KEY_ID
const key_secret = process.env.RAZORPAY_KEY_SECRET


const razorpay = new Razorpay({
  key_id: key_id,
  key_secret: key_secret
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
    res.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
  }
});

router.post("/verification", async (req, res) => {
  const secret = key_secret

  const crypto = require("crypto");
  const shasum = crypto.createHmac(encryption_type, secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest === req.razorpay_signature) {
    // save this to database
  } else {
  }

  res.json({ status: "ok" });
});

module.exports = router;
