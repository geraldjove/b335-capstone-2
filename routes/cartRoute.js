const express = require("express");
const router = express.Router();

const auth = require("../auth");
const { verify, verifyAdmin } = auth;

const cartController = require("../controllers/cartController");

router.get("/cart", verify, cartController.getUserCart);
router.post("/add-to-cart/", verify, cartController.addToCart);
router.patch(
  "/update-cart-quantity",
  verify,
  cartController.updateCartQuantity
);

module.exports = router;
