const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
    },
    customerType: {
        type: String,
        required:true
    }
});

adminSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

adminSchema.set('toJSON', {
    virtuals: true,
});

exports.Admin = mongoose.model('admin', adminSchema);


