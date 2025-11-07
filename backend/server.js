require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Import routes
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// ═══════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-session-id"],
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  if (req.headers["x-session-id"]) {
    console.log(`  Session: ${req.headers["x-session-id"]}`);
  }
  next();
});

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 seconds
  next();
});

// ═══════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "🛒 E-Commerce Shopping Cart API",
    version: "1.0.0",
    status: "Running",
    timestamp: new Date().toISOString(),
    endpoints: {
      products: {
        getAll: "GET /api/products",
        getById: "GET /api/products/:id",
        getByCategory: "GET /api/products/category/:category",
      },
      cart: {
        get: "GET /api/cart",
        add: "POST /api/cart",
        update: "PUT /api/cart/:id",
        remove: "DELETE /api/cart/:id",
        clear: "DELETE /api/cart",
      },
      checkout: {
        create: "POST /api/checkout",
      },
      orders: {
        getById: "GET /api/orders/:orderId",
        getByEmail: "GET /api/orders/customer/:email",
      },
    },
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    database: "Connected",
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
    },
  });
});

// API routes
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", orderRoutes);
app.use("/api/orders", orderRoutes);

// ═══════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════

// 404 handler - must be after all other routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler - must be last
app.use(errorHandler);

// ═══════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("\n════════════════════════════════════════");
  console.log("🚀 SERVER STARTED SUCCESSFULLY");
  console.log("════════════════════════════════════════");
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log("════════════════════════════════════════\n");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("\n❌ UNHANDLED PROMISE REJECTION:");
  console.error(err);
  // Close server & exit
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("\n❌ UNCAUGHT EXCEPTION:");
  console.error(err);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n📴 SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});
