const Product = require("../models/Product");
const axios = require("axios");

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    // Check if products exist in database
    let products = await Product.find({ isAvailable: true }).sort({ id: 1 });

    // If no products, fetch from Fake Store API
    if (products.length === 0) {
      console.log(
        "📦 No products found in database. Fetching from Fake Store API..."
      );

      try {
        const response = await axios.get(
          `${process.env.FAKE_STORE_API}/products?limit=10`,
          {
            timeout: 10000,
          }
        );
        const apiProducts = response.data;

        // Save products to database
        products = await Product.insertMany(apiProducts);
        console.log(
          `✅ Successfully saved ${products.length} products to database`
        );
      } catch (apiError) {
        console.error(
          "⚠️  Failed to fetch from Fake Store API:",
          apiError.message
        );
        return res.status(503).json({
          success: false,
          message:
            "Unable to fetch products from external API. Please try again later.",
          error: apiError.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("❌ Error in getProducts:", error.message);
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID is a number
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID. Must be a number.",
      });
    }

    const product = await Product.findOne({ id: parseInt(id) });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`,
      });
    }

    if (!product.isAvailable) {
      return res.status(404).json({
        success: false,
        message: "Product is currently unavailable",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("❌ Error in getProductById:", error.message);
    next(error);
  }
};

/**
 * @desc    Get products by category
 * @route   GET /api/products/category/:category
 * @access  Public
 */
const getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const products = await Product.findByCategory(category);

    res.status(200).json({
      success: true,
      count: products.length,
      category: category,
      data: products,
    });
  } catch (error) {
    console.error("❌ Error in getProductsByCategory:", error.message);
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductsByCategory,
};
