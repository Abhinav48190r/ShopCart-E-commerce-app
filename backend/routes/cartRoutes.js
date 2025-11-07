const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

// Validation rules
const addToCartValidation = [
  body("productId")
    .isInt({ min: 1 })
    .withMessage("Valid product ID is required"),
  body("quantity")
    .isInt({ min: 1, max: 100 })
    .withMessage("Quantity must be between 1 and 100"),
];

const updateCartValidation = [
  body("quantity")
    .isInt({ min: 1, max: 100 })
    .withMessage("Quantity must be between 1 and 100"),
];

// @route   GET /api/cart
// @desc    Get cart items
// @access  Public
router.get("/", getCart);

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Public
router.post("/", addToCartValidation, addToCart);

// @route   PUT /api/cart/:id
// @desc    Update cart item quantity
// @access  Public
router.put("/:id", updateCartValidation, updateCartItem);

// @route   DELETE /api/cart/:id
// @desc    Remove item from cart
// @access  Public
router.delete("/:id", removeFromCart);

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Public
router.delete("/", clearCart);

module.exports = router;
