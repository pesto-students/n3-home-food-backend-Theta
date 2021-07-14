const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    sellerDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'seller',
    },
    orderItems: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Carts',
    },
    DeliveryType: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'Pending',
    },
    totalPrice: {
        type: Number,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    rating: {
        type: Number,
        default:0
    },
    rated:{
        type:Boolean,
        default:false
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
    },
})

orderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

orderSchema.set('toJSON', {
    virtuals: true,
});

exports.Order = mongoose.model('Order', orderSchema);
