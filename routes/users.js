const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Secret = process.env.USER_SECRET;
const mongoose = require("mongoose");
const { Order } = require("../models/order");
const { Seller } = require("../models/seller");
const Expiration_time = "1w"


router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-passwordHash");

  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});

router.get(`/count`, async (req, res) => {
  const userCount = await User.countDocuments((count) => count);

  if (!userCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    userCount: userCount,
  });
});

router.get(`/count`, async (req, res) => {
  const userCount = await User.countDocuments((count) => count);

  if (!userCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    userCount: userCount,
  });

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
  // check if seller exist with this number

  const seller = await Seller.findOne({ phone: req.body.phone });
  if (seller) {
 
    if (req.body.phone === seller.phone && seller.status == "Approved") {
      let secret = 'SELLER'
      const token = jwt.sign(
        {
          userId: seller.id,
          customerType: seller.customerType,
        },
        secret,
        { expiresIn: "Expiration_time" }
      );
  
      res.status(200).json({
        success: true,
        token: token,
        userType: seller.customerType,
        id: seller.id,
      });
  
    }
    else if(req.body.phone === seller.phone && seller.status == "Pending"){
      res
      .status(400)
      .send("you dont have access to seller panel please contact admin");
  }
  }

 
  

  // check if the user exist
  const user = await User.findOne({ phone: req.body.phone });
  if (!user){
    // if not create a user and then login
    let user = new User({
      phone: req.body.phone,
      customerType:'Customer'
    });
    user = await user.save();
    if (!user) return res.status(400).send("the user cannot be created!");
    let secret = 'USER'
    const token = jwt.sign(
      {
        userId: user.id,
        customerType: user.customerType,
      },
      secret,
      { expiresIn: Expiration_time }
    );
    res.status(200).json({ success: true, token: token , userType : user.customerType ,userId:user.id });
  }
  else if(user){
    const token = jwt.sign(
      {
        userId: user.id,
        customerType: user.customerType,
      },
      Secret,
      { expiresIn: Expiration_time }
    );
    res.status(200).json({ success: true, token: token , userType : user.customerType ,id:user.id});
  }
  else{
    res.status(400).send("Sorry, we were unable to login!");
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


router.put(`/remove-cart/:id`, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Customer Id");
  }

  const user = await User.findById(req.params.id);


  const updatedUser = await User.findByIdAndUpdate(
    user.id,
    {
      cart:null
    },
    { new: true }
  );
  if (!updatedUser)
    return res.status(400).send("the user cannot be updated!");

  res.send(user);
});



module.exports = router;
