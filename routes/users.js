const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Secret = process.env.SECRET;
const mongoose = require("mongoose");

router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-passwordHash");

  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");

  if (!user) {
    res
      .status(500)
      .json({ message: "The user with the given ID was not found." });
  }
  res.status(200).send(user);
});

router.post("/", async (req, res) => {
  let user = new User({
    phone: req.body.phone,
  });
  user = await user.save();
  if (!user) return res.status(400).send("the user cannot be created!");
  res.send(user);
});

router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Customer Id");
  }

  const user = await User.findByIdAndUpdate(req.params.id, {
    phone: req.body.phone,
    customerType: req.body.customerType
  },{new:true}
  );

  if (!user) return res.status(400).send("the user cannot be updated!");
  res.send(user);
});

router.post("/login", async (req, res) => {
  console.log(req.body.phone);
  const user = await User.findOne({ phone: req.body.phone });
  if (!user) return res.status(400).send("No User Found");

  if (req.body.phone === user.phone) {
    const token = jwt.sign(
      {
        userId: user.id,
        customerType: user.customerType,
      },
      Secret,
      { expiresIn: "1w" }
    );

    res.status(200).json({ success: true, token: token , userType : user.customerType });
  } else {
    res.status(400).send("Invalid Password");
  }
});

router.get(`/get/count`, async (req, res) => {
  const userCount = await User.countDocuments((count) => count);

  if (!userCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    userCount: userCount,
  });
});

module.exports = router;
