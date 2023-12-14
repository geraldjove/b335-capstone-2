const Cart = require('../models/Cart');
const Product = require('../models/Product');

module.exports.getUserCart = (req, res) =>{
    return Cart.findOne({userId: req.user.id})
    .then((result)=>{
        console.log(result);
        if(!result || result.length === 0){
            res.status(404).send({message: 'Empty Cart'})
        } else {
            res.status(200).send({message: result})
        }
    })
    .catch((error) => {
        console.error(error);
        return res.status(500).send({ message: 'Internal server error.' });
      });
}

module.exports.addToCart = (req, res) => {
    Cart.findOne({ userId: req.user.id })
        .then((cartResult) => {
            if (cartResult) {
                const existingProduct = cartResult.cartItems.find(item => item.productId === req.body.productId);

                if (existingProduct) {
                    return res.status(400).send({ message: 'Product is already in the cart. Please proceed to PATCH /carts/update-cart-quantity' });
                } else {
                    Product.findById(req.body.productId)
                        .then((product) => {
                            if (!product) {
                                return res.status(404).send({ message: 'Product does not exist.' });
                            }

                            cartResult.cartItems.push({
                                productId: req.body.productId,
                                quantity: req.body.quantity,
                                subtotal: req.body.quantity * product.price,
                                price: product.price,
                            });

                            cartResult.totalPrice = cartResult.cartItems.reduce((total, item) => total + item.subtotal, 0);

                            cartResult.save()
                                .then(updatedCart => {
                                    // Updated totalPrice, now send the response
                                    res.status(200).send({ message: updatedCart });
                                })
                                .catch(error => res.status(400).send({ message: 'Failed to update cart' }));
                        })
                        .catch(error => res.status(500).send({ message: 'Internal server error.' + error }));
                }
            } else {
                Product.findById(req.body.productId)
                    .then((product) => {
                        if (!product) {
                            return res.status(404).send({ message: 'Product does not exist.' });
                        }

                        const newCart = new Cart({
                            userId: req.user.id,
                            cartItems: [
                                {
                                    productId: req.body.productId,
                                    quantity: req.body.quantity,
                                    subtotal: req.body.quantity * product.price,
                                    price: product.price,
                                },
                            ],
                            totalPrice: req.body.quantity * product.price,
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

            // Resolve all promises
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




