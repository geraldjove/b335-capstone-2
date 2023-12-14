const Cart = require("../models/Cart");
const Product = require("../models/Product");

module.exports.getUserCart = (req, res) => {
  Cart.findOne({ userId: req.user.id })
    .then((cart) => {
      if (cart) {
        return res.status(200).send({ cart: cart });
      } else {
        return res
          .status(200)
          .send({ message: "There's no added items in the cart" });
      }
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(500)
        .send({ success: false, message: "Internal Server Error" });
    });
};

module.exports.addToCart = async (req, res) => {
  try {
    const { quantity, productId } = req.body;
    const userId = req.user.id;

    const hexRegex = /^[0-9a-fA-F]{24}$/;

    // Check if it is a 24-character hex string

    if (productId == "") {
      return res.status(400).send({ message: "Please provide product Id" });
    } else if (!hexRegex.test(productId) || productId instanceof Uint8Array) {
      return res.status(404).send({ message: "No product found" });
    } else {
      const product = await Product.findById(productId);

      // Check if the product with the provided productId does not exist

      const subtotal = product.price * quantity;

      let userCart = await Cart.findOne({ userId: userId });

      if (!userCart) {
        userCart = new Cart({
          userId,
          cartItems: [],
        });
      }

      userCart.cartItems.push({
        productId: productId,
        quantity: quantity,
        subtotal: subtotal,
      });

      userCart.totalPrice += subtotal;

      await userCart.save().then((userCart) => {
        const addedCart = userCart.cartItems[userCart.cartItems.length - 1];
        return res.status(200).send({
          message: "Item added to cart successfully",
          userId: userId,
          added_cart: addedCart,
        });
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).status({ message: "Internal Server Code" });
  }
};

module.exports.updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    console.log(quantity);

    const userCart = await Cart.findOne({ userId: userId });
    const product = await Product.findById(productId);

    // Find the index of the product in the cart
    const productIndex = userCart.cartItems.findIndex((item) => {
      return item.productId === productId;
    });

    console.log(productIndex);
    if (productIndex !== -1) {
      // Update the quantity and subtotal
      userCart.cartItems[productIndex].quantity = quantity;
      userCart.cartItems[productIndex].subtotal = product.price * quantity;
      // Recalculate the total price
      userCart.totalPrice = userCart.cartItems.reduce(
        (total, item) => total + item.subtotal,
        0
      );

      // Save the updated cart
      await userCart.save().then((updated_cart) => {
        return res.status(200).send(updated_cart);
      });

      return res
        .status(200)
        .send({ message: "Cart updated successfully", cart: userCart });
    } else {
      return res.status(404).send({ message: "Product not found in the cart" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};
