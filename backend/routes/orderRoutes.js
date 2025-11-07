const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  createOrder,
  getOrderById,
  getOrdersByEmail,
} = require("../controllers/orderController");

// Validation rules for checkout
const checkoutValidation = [
  body("customerName")
    .trim()
    .notEmpty()
    .withMessage("Customer name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("customerEmail")
    .trim()
    .notEmpty()
    .withMessage("Customer email is required")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email address is required"),
];

// @route   POST /api/checkout
// @desc    Create checkout order
// @access  Public
router.post("/", checkoutValidation, createOrder);

// @route   GET /api/orders/customer/:email
// @desc    Get orders by customer email
// @access  Public
router.get("/customer/:email", getOrdersByEmail);

// @route   GET /api/orders/:orderId
// @desc    Get order by ID
// @access  Public
router.get("/:orderId", getOrderById);

module.exports = router;
