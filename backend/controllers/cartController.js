const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { validationResult } = require("express-validator");

/**
 * @desc    Get cart items
 * @route   GET /api/cart
 * @access  Public
 */
const getCart = async (req, res, next) => {
  try {
    const sessionId = req.headers["x-session-id"];

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required in headers (x-session-id)",
      });
    }

    let cart = await Cart.findOne({ sessionId, status: "active" });

    if (!cart) {
      cart = await Cart.create({ sessionId, items: [] });
    }

    res.status(200).json({
      success: true,
      data: {
        sessionId: cart.sessionId,
        items: cart.items,
        total: cart.total,
        itemCount: cart.itemCount,
      },
    });
  } catch (error) {
    console.error("❌ Error in getCart:", error.message);
    next(error);
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Public
 */
const addToCart = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { productId, quantity } = req.body;
    const sessionId = req.headers["x-session-id"];

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required in headers (x-session-id)",
      });
    }

    // Verify product exists and is available
    const product = await Product.findOne({ id: productId, isAvailable: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or unavailable",
      });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} items available.`,
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ sessionId, status: "active" });
    if (!cart) {
      cart = await Cart.create({ sessionId, items: [] });
    }

    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${quantity} more items. Only ${product.stock} available in stock.`,
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        productId: product.id,
        quantity,
        price: product.price,
        title: product.title,
        image: product.image,
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: {
        sessionId: cart.sessionId,
        items: cart.items,
        total: cart.total,
        itemCount: cart.itemCount,
      },
    });
  } catch (error) {
    console.error("❌ Error in addToCart:", error.message);
    next(error);
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:id
 * @access  Public
 */
const updateCartItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { quantity } = req.body;
    const sessionId = req.headers["x-session-id"];

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required in headers (x-session-id)",
      });
    }

    const cart = await Cart.findOne({ sessionId, status: "active" });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === parseInt(id)
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // Check product stock
    const product = await Product.findOne({ id: parseInt(id) });
    if (product && quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: {
        items: cart.items,
        total: cart.total,
        itemCount: cart.itemCount,
      },
    });
  } catch (error) {
    console.error("❌ Error in updateCartItem:", error.message);
    next(error);
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:id
 * @access  Public
 */
const removeFromCart = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sessionId = req.headers["x-session-id"];

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required in headers (x-session-id)",
      });
    }

    const cart = await Cart.findOne({ sessionId, status: "active" });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item) => item.productId !== parseInt(id));

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: {
        items: cart.items,
        total: cart.total,
        itemCount: cart.itemCount,
      },
    });
  } catch (error) {
    console.error("❌ Error in removeFromCart:", error.message);
    next(error);
  }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Public
 */
const clearCart = async (req, res, next) => {
  try {
    const sessionId = req.headers["x-session-id"];

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required in headers (x-session-id)",
      });
    }

    const cart = await Cart.findOne({ sessionId, status: "active" });

    if (cart) {
      await cart.clearCart();
    }

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: {
        items: [],
        total: 0,
        itemCount: 0,
      },
    });
  } catch (error) {
    console.error("❌ Error in clearCart:", error.message);
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
