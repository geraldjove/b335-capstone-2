const Order = require('../models/Order');
const Cart = require('../models/Cart');

module.exports.userCheckout = (req, res) => {
    const userId = req.user.id;

    Cart.findOne({ userId: userId })
        .then((cart) => {
            if (!cart || cart.cartItems.length === 0) {
                return res.status(400).send({ message: 'The cart is empty' });
            }

            Order.findOne({ userId: userId })
                .then((existingOrder) => {
                    if (existingOrder) {
                        return Order.findOneAndUpdate(
                            { userId: userId },
                            {
                                productsOrdered: cart.cartItems,
                                totalPrice: cart.totalPrice,
                            },
                            { new: true }
                        )
                            .then((updatedOrder) => {
                                console.log(updatedOrder);
                                res.status(200).send({ update: updatedOrder });
                            })
                            .catch((error) => {
                                console.error(error);
                                return res.status(500).send({ message: 'Internal server error.' + error });
                            });
                    } else {
                        let newOrder = new Order({
                            userId: userId,
                            productsOrdered: cart.cartItems,
                            totalPrice: cart.totalPrice,
                        });

                        return newOrder.save()
                            .then((savedOrder, err) => {
                                if (err) {
                                    res.status(400).send({ message: 'Order not saved' });
                                } else {
                                    res.status(200).send({ message: savedOrder });
                                }
                            })
                            .catch((error) => {
                                console.error(error);
                                return res.status(500).send({ message: 'Internal server error.' + error });
                            });
                    }
                });
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).send({ message: 'Internal server error.' + error });
        });
};

module.exports.getUserOrders = (req, res) => {
    return Order.findOne({userId: req.user.id})
    .then((result)=>{
        if(!result || result == null){
            return res.status(404).send({message: 'No orders found'})
        } else {
            return res.status(200).send({message: result})
        }
    })
    .catch((error) => {
        console.error(error);
        return res.status(500).send({ message: 'Internal server error.' + error });
    });
};

module.exports.getAllOrders = (req, res) =>{
    return Order.find({})
    .then((result)=>{
        if(!result || result == null){
            return res.status(404).send({message: 'No orders found'})
        } else {
            return res.status(200).send({message: result})
        }
    })
    .catch((error) => {
        console.error(error);
        return res.status(500).send({ message: 'Internal server error.' + error });
    });
};
