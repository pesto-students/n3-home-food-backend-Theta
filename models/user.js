const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
    },
    customerType: {
        type: String,
        default: 'User',
    },
    cart:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    }

});

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
});

exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;
