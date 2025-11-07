const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: Number,
      required: [true, "Product ID is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      default: 1,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be an integer",
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Product image is required"],
    },
    subtotal: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: true,
  }
);

// Calculate subtotal before validation
cartItemSchema.pre("validate", function (next) {
  this.subtotal = this.price * this.quantity;
  next();
});

const cartSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: [true, "Session ID is required"],
      unique: true,
      index: true,
      default: () =>
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    },
    items: [cartItemSchema],
    total: {
      type: Number,
      default: 0,
      min: [0, "Total cannot be negative"],
    },
    itemCount: {
      type: Number,
      default: 0,
      min: [0, "Item count cannot be negative"],
    },
    status: {
      type: String,
      enum: ["active", "checked_out", "abandoned"],
      default: "active",
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "carts",
  }
);

// Indexes
cartSchema.index({ sessionId: 1 });
cartSchema.index({ lastActivity: 1 });
cartSchema.index({ status: 1 });

// Virtual
cartSchema.virtual("formattedTotal").get(function () {
  return `$${this.total.toFixed(2)}`;
});

// Pre-save middleware
cartSchema.pre("save", function (next) {
  this.itemCount = this.items.reduce((count, item) => count + item.quantity, 0);
  this.total = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  this.lastActivity = new Date();
  next();
});

// Methods
cartSchema.methods.addItem = function (
  productId,
  quantity,
  price,
  title,
  image
) {
  const existingItem = this.items.find((item) => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({ productId, quantity, price, title, image });
  }

  return this.save();
};

cartSchema.methods.removeItem = function (productId) {
  this.items = this.items.filter((item) => item.productId !== productId);
  return this.save();
};

cartSchema.methods.updateItemQuantity = function (productId, quantity) {
  const item = this.items.find((item) => item.productId === productId);
  if (item) {
    item.quantity = quantity;
  }
  return this.save();
};

cartSchema.methods.clearCart = function () {
  this.items = [];
  return this.save();
};

module.exports = mongoose.model("Cart", cartSchema);
