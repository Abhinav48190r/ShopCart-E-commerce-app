const Order = require("../models/Order");
const Cart = require("../models/Cart");
const { validationResult } = require("express-validator");

/**
 * @desc    Create checkout order
 * @route   POST /api/checkout
 * @access  Public
 */
const createOrder = async (req, res, next) => {
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

    const { customerName, customerEmail } = req.body;
    const sessionId = req.headers["x-session-id"];

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required in headers (x-session-id)",
      });
    }

    // Get cart
    const cart = await Cart.findOne({ sessionId, status: "active" });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty. Cannot create order.",
      });
    }

    // Create order
    const order = await Order.create({
      customerName,
      customerEmail,
      items: cart.items.map((item) => ({
        productId: item.productId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        subtotal: item.subtotal,
      })),
    });

    // Mark cart as checked out and clear items
    cart.status = "checked_out";
    cart.items = [];
    await cart.save();

    console.log(`✅ Order created: ${order.orderId} for ${customerEmail}`);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: {
        orderId: order.orderId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: order.items,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        timestamp: order.createdAt,
        status: order.status,
      },
    });
  } catch (error) {
    console.error("❌ Error in createOrder:", error.message);
    next(error);
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:orderId
 * @access  Public
 */
const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${orderId} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("❌ Error in getOrderById:", error.message);
    next(error);
  }
};

/**
 * @desc    Get orders by customer email
 * @route   GET /api/orders/customer/:email
 * @access  Public
 */
const getOrdersByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;

    const orders = await Order.findByCustomerEmail(email);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("❌ Error in getOrdersByEmail:", error.message);
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getOrdersByEmail,
};
