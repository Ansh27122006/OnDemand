const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");

const customer = [protect, authorizeRoles("customer")];

router.get("/", customer, getCart);
router.post("/", customer, addToCart);
router.put("/:itemId", customer, updateCartItem);
router.delete("/clear", customer, clearCart);
router.delete("/:itemId", customer, removeCartItem);

module.exports = router;
