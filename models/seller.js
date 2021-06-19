const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    image:{
        type:String,
        default:''
    },
    customerType: {
        type: String,
        default:'Seller'
    },
    adress: {
        type: String,
        default: ''
    },
    idProof:{
        type:String,
        required: true,
    },
    products:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Product'
    }],
    productCategories:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Category'
    }],
    requestedProducts:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Product'
    }],
    status:{
        type:String,
        default:'Pending'
    },
    rejection_reason:{
        type: String
    }


});

sellerSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

sellerSchema.set('toJSON', {
    virtuals: true,
});

exports.Seller = mongoose.model('seller', sellerSchema);

//exports.sellerSchema = sellerSchema;
