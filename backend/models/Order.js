const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    image: {
      type: String,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () =>
        `ORD-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)
          .toUpperCase()}`,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "Order must contain at least one item",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    shipping: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: [true, "Order total is required"],
      min: [0, "Total cannot be negative"],
    },
    status: {
      type: String,
      enum: {
        values: [
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ],
        message: "{VALUE} is not a valid status",
      },
      default: "confirmed",
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "debit_card", "paypal", "cash_on_delivery"],
      default: "credit_card",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "paid",
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    collection: "orders",
  }
);

// Indexes
orderSchema.index({ orderId: 1 });
orderSchema.index({ customerEmail: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Virtuals
orderSchema.virtual("formattedTotal").get(function () {
  return `$${this.total.toFixed(2)}`;
});

orderSchema.virtual("itemCount").get(function () {
  return this.items.reduce((count, item) => count + item.quantity, 0);
});

// Pre-save middleware
orderSchema.pre("save", function (next) {
  this.subtotal = this.items.reduce((sum, item) => {
    item.subtotal = item.price * item.quantity;
    return sum + item.subtotal;
  }, 0);

  this.tax = this.subtotal * 0.1;
  this.total = this.subtotal + this.tax + this.shipping;

  next();
});

// Methods
orderSchema.methods.updateStatus = function (newStatus) {
  this.status = newStatus;
  return this.save();
};

orderSchema.statics.findByCustomerEmail = function (email) {
  return this.find({ customerEmail: email.toLowerCase() }).sort({
    createdAt: -1,
  });
};

module.exports = mongoose.model("Order", orderSchema);
