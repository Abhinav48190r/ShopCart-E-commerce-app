const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  getProductsByCategory,
} = require("../controllers/productController");

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get("/", getProducts);

// @route   GET /api/products/category/:category
// @desc    Get products by category
// @access  Public
router.get("/category/:category", getProductsByCategory);

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get("/:id", getProductById);

module.exports = router;
