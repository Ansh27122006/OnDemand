const Cart = require("../models/Cart");

// @desc    Get cart for logged-in customer
// @route   GET /api/cart
// @access  Customer (protected)
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customerId: req.user._id }).populate(
      "items.productId",
      "name price images"
    );

    if (!cart) {
      return res.status(200).json({ customerId: req.user._id, items: [] });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Add item to cart (or increase quantity if already present)
// @route   POST /api/cart
// @access  Customer (protected)
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ customerId: req.user._id });

    if (!cart) {
      // No cart yet — create one with this item
      cart = await Cart.create({
        customerId: req.user._id,
        items: [{ productId, quantity }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingItem) {
        // Item already in cart — increase quantity
        existingItem.quantity += quantity;
      } else {
        // New item — push to array
        cart.items.push({ productId, quantity });
      }

      await cart.save();
    }

    await cart.populate("items.productId", "name price images");

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update quantity of a specific cart item
// @route   PUT /api/cart/:itemId
// @access  Customer (protected)
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    const cart = await Cart.findOne({ customerId: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = quantity;
    await cart.save();

    await cart.populate("items.productId", "name price images");

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Remove a specific item from the cart
// @route   DELETE /api/cart/:itemId
// @access  Customer (protected)
const removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customerId: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemExists = cart.items.id(req.params.itemId);

    if (!itemExists) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items.pull({ _id: req.params.itemId });
    await cart.save();

    await cart.populate("items.productId", "name price images");

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Clear all items from the cart
// @route   DELETE /api/cart
// @access  Customer (protected)
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customerId: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };