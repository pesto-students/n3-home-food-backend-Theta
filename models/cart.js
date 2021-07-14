const mongoose = require('mongoose');
const product = "Product"

const itemSchema = mongoose.Schema({
    productId :{
        type:mongoose.Schema.Types.ObjectId,
        ref:product
    },
    quantity:{
        type:Number,
        required:true,
        min:[1,'Quantity cannot be less than 1']
    },
    price:{
        type:Number,
        required:true
    },
    total:{
        type:Number,
        required:true
    }
})


const cartSchema = mongoose.Schema({

    items: [itemSchema],
    subTotal:{
        type:Number,
        default:0
    },
    SellerId :{
        type:mongoose.Schema. Types.ObjectId,
        ref:"seller"
    },
})


cartSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

cartSchema.set('toJSON', {
    virtuals: true,
});

exports.Cart = mongoose.model('Carts', cartSchema);
