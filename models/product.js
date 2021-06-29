const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
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
    },
    max_price : {
        type: Number,
        required:true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required:true
    },
    status:{
        type: String,
        default:'Approved'
    },
    rejection_reason:{
        type: String
    },
    reassigned_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Product'
    }
})

productSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals: true,
});


exports.Product = mongoose.model('Product', productSchema);
