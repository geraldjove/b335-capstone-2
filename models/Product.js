const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Required product name']
    },
    description: {
        type: String,
        required: [true, 'Required product description']
    },
    price: {
        type: Number,
        require: [true, 'Required product price']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdOn:{
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Product', productSchema);