const mongoose = require('mongoose');

const myItemSchema = mongoose.Schema({
    productId :{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    },
    quantity:{
        type:Number,
        default:1,
        min:[1,'Quantity cannot be less than 1']
    },
    price:{
        type:Number,
        default:0
     } ,
     productCategory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
     }],
     name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ''
    }
})


const sellerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String
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
    myProducts:[myItemSchema],
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
    },
    description:{
        type: String
    },
    rating:{
        type:Number,
        default:0
    },
    max_amount:{
        type:Number,
        default:0
    },
    pincode:{
        type:Number,
        default:500000
    },
    display_name:{
        type:String,
        default:''
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
