const { Cart } = require("../models/cart");
const express = require("express");
const router = express.Router();
const { Product } = require("../models/product");
const { User } = require("../models/user");

const mongoose = require("mongoose");

// router.get(`/`, async (req, res) => {
//   const cart = await Cart.find();

//   if (!cart) {
//     res.status(500).json({ success: false });
//   }
//   res.status(200).send(cart);
// });


// get user cart by userid
router.get(`/:id`, async (req, res) => {

   const user = await User.findById(req.params.id).select({cart:1})
  if(!user) res.status(500).json({success:false})

  const cart = await Cart.findById(user.cart).populate({path:'items',populate:'productId'})
  // const cart = await Cart.findById(user.cart)
  if(!cart) res.status(500).json({ items:[] })

  


  res.status(200).send(cart);
});

router.post(`/`, async (req, res) => {
  const productId = req.body.productId;
  const quantity = req.body.quantity;
  const userId = req.body.userId;
  const price = req.body.price;




  let productDetails = await Product.findById(productId);
  console.log('product',productDetails)
  if (!productDetails) {
    return res.status(500).json({
      type: "Not Found",
      msg: "Invalid request",
    });
  }

  // check if the item is already in the cart
  // let cart = await Cart.findById('')

  // if cart is not created for a user
  const user = await User.findById(userId);
  if (!user) return res.status(500).send("No user found");

  // if cart already exist
  if (user.cart) {
  
    //---- Check if index exists ----
    let cart = await Cart.findById(user.cart);
    const indexFound = cart.items.findIndex(
      (item) => item.productId.toString() == productId
    );
    console.log("indexFound", indexFound);
    // item do not exist
    if(indexFound === -1 && quantity > 0){
            const product = {
                productId: productId,
                quantity: quantity,
                price: price,
                total: parseInt(price * quantity)
            }
            cart.items.push(product)
            // get new subtototal
            cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
    }

    /*item exist and getting removed */ 
    // check if product is getting removed
    else if(indexFound !== -1 && quantity <= 0){
             // delete that item
            cart.items.splice(indexFound, 1);
            if (cart.items.length == 0) {
                cart.subTotal = 0;
            } else {
                // get new subtototal
                cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
            }
         }

    // check if product already exist and updated existing one
    else if(indexFound !== -1 ){

        // cart.items[indexFound].quantity = cart.items[indexFound].quantity +1
        cart.items[indexFound].quantity = quantity
        cart.items[indexFound].price = price
        cart.items[indexFound].total =  parseInt(price * quantity)
        cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);

    }
    let data = await cart.save();
    res.send(data);
  }
  // if cart do not exist create a new cart and add item
  else if (!user.cart) {
    // if cart is empty then adds new cart and then add a item to it
    const cartData = new Cart({
      items: [
        {
          productId: productId,
          quantity: quantity,
          price: price,
          total: parseInt(price * quantity)
        },
      ],
      subTotal: Number(price) * Number(quantity),
    });

    cart = await cartData.save();

    // add cart id to user
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        name: user.name,
        phone: user.phone,
        cart: cart.id,
      },
      { new: true }
    );
    if (!updatedUser)
      return res.status(400).send("the user cannot be updated!");

    if (!cart)
      return res.status(500).send("The product could not be added to the cart");
    res.send(cart);
  }
});

module.exports = router;
