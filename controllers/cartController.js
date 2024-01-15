const Cart = require('../models/Cart');
const Product = require('../models/Product');

module.exports.getUserCart = (req, res) => {
    Cart.findOne({ userId: req.user.id })
        .then((cart) => {
            if (!cart || cart.cartItems.length === 0) {
                res.status(404).send({ message: 'Empty Cart' });
            } else {
                res.status(200).send({ message: cart });
            }
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).send({success: false, message: "Internal Server Error"});
        });
};

module.exports.addToCart = (req, res) => {
    const { quantity, productId } = req.body;
    Cart.findOne({ userId: req.user.id })
        .then((cartResult) => {
            if (cartResult) {
                const existingProduct = cartResult.cartItems.find(item => item.productId === productId);

                if (existingProduct) {
                    return res.status(400).send({ message: 'Product is already in the cart. Please proceed to PATCH /carts/update-cart-quantity', existingProduct });
                } else {
                    Product.findById(productId)
                        .then((product) => {
                            if (!product) {
                                return res.status(404).send({ message: 'Product does not exist.' });
                            }

                            cartResult.cartItems.push({
                                productId: productId,
                                quantity: quantity,
                                subtotal: quantity * product.price,
                                price: product.price,
                            });

                            cartResult.totalPrice = cartResult.cartItems.reduce((total, item) => total + item.subtotal, 0);

                            cartResult.save()
                                .then(updatedCart => {
                                    res.status(200).send({ message: updatedCart });
                                })
                                .catch(error => res.status(400).send({ message: 'Failed to update cart' }));
                        })
                        .catch(error => res.status(500).send({ message: 'Internal server error.' + error }));
                }
            } else {
                Product.findById(productId)
                    .then((product) => {
                        if (!product) {
                            return res.status(404).send({ message: 'Product does not exist.' });
                        }
                        const productName = product.name;
                        const newCart = new Cart({
                            userId: req.user.id,
                            cartItems: [
                                {
                                    productId: productId,
                                    name: productName,
                                    quantity: quantity,
                                    subtotal: quantity * product.price,
                                    price: product.price,
                                },
                            ],
                            totalPrice: quantity * product.price,
                        });

                        newCart.save()
                            .then(savedCart => res.status(200).send({ message: savedCart }))
                            .catch(error => res.status(403).send({ message: 'Cart not saved' }));
                    })
                    .catch(error => res.status(500).send({ message: 'Internal server error.' + error }));
            }
        })
        .catch(error => res.status(500).send({ message: 'Internal server error.' + error }));
};

module.exports.updateCartQuantity = (req, res) => {
    Cart.findOneAndUpdate(
        { userId: req.user.id, 'cartItems.productId': req.body.productId },
        { $set: { 'cartItems.$.quantity': req.body.quantity } },
        { new: true }
    )
    .then((result) => {
        if (!result) {
            return res.status(404).send({ message: "The product you're trying to change quantity with is not within the cart." });
        } else {
            const fetchProductDetails = result.cartItems.map(item =>
                Product.findById(item.productId)
                    .then(product => {
                        if (!product) {
                            throw new Error("Product not found.");
                        }
                        item.price = product.price;
                        item.subtotal = item.quantity * item.price;
                        return item;
                    })
            );

            return Promise.all(fetchProductDetails)
                .then(updatedCartItems => {
                    result.totalPrice = updatedCartItems.reduce((total, item) => total + item.subtotal, 0);
                    return result.save();
                })
                .then(updatedCart => res.status(200).send({ message: 'Successfully changed quantity to ' + req.body.quantity, updatedCart }))
                .catch(error => res.status(400).send({ message: 'Failed to update cart: ' + error.message }));
        }
    })
    .catch((error) => {
        console.error(error);
        return res.status(500).send({ message: 'Internal server error.' + error });
    });
};

module.exports.removeProduct = (req, res) => {
    Cart.findOne({ userId: req.user.id })
        .then((result) => {
            if (!result) {
                return res.status(404).send({ message: 'No cart found.' });
            }

            // Check if the product exists in the cart
            const productIndex = result.cartItems.findIndex(item => item.productId === req.params.productId);

            if (productIndex !== -1) {
                // Product found, remove it from the cart
                result.cartItems.splice(productIndex, 1);

                // Update the totalPrice
                result.totalPrice = result.cartItems.reduce((total, item) => total + item.subtotal, 0);

                // Save the updated cart
                result.save()
                    .then((updatedCart) => res.status(200).send({ message: 'Successfully removed product with productId ' + req.params.productId, updatedCart }))
                    .catch(error => res.status(500).send({ message: 'Failed to update cart: ' + error }));
            } else {
                // Product not found in the cart
                return res.status(404).send({ message: 'Product with productId ' + req.params.productId + ' is not in the cart.' });
            }
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).send({ message: 'Internal server error.' + error });
        });
};


module.exports.clearCart = (req, res) => {
    Cart.findOne({ userId: req.user.id })
        .then((result) => {
            if (!result) {
                return res.status(404).send({ message: 'No cart found.' });
            } else if (result.cartItems.length === 0) {
                return res.status(200).send({ message: 'Cart is already empty.' });
            } else {
                result.cartItems = [];
                result.totalPrice = 0;
                result.save()
                    .then(updatedCart => res.status(200).send({ message: 'Successfully cleared all products from the cart.' }))
                    .catch(error => res.status(500).send({ message: 'Failed to clear cart: ' + error }));
            }
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).send({ message: 'Internal server error.' + error });
        });
};
