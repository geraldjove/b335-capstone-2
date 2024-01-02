const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: [true, 'User ID is requried']
    },
    productsOrdered: [
        {
            productId:{
                type: String,
				required: [true, 'Product ID is required']
            },
            quantity: {
                type: Number,
                required: [true, 'Quantity is required']
            },
            subtotal: {
                type: Number,
                required: [true, 'Subtotal is required']
            }
        }
    ],
    totalPrice:{
        type: Number,
        require: [true, 'Total Price is required']
    },
    orderedOn: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: 'Processing for delivery'
    }
})

module.exports = mongoose.model('Order', orderSchema);