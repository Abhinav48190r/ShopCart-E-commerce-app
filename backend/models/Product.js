const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: [true, "Product ID is required"],
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
      validate: {
        validator: function (value) {
          return value > 0;
        },
        message: "Price must be greater than 0",
      },
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Product image URL is required"],
    },
    rating: {
      rate: {
        type: Number,
        default: 0,
        min: [0, "Rating cannot be less than 0"],
        max: [5, "Rating cannot be more than 5"],
      },
      count: {
        type: Number,
        default: 0,
        min: [0, "Rating count cannot be negative"],
      },
    },
    stock: {
      type: Number,
      default: 100,
      min: [0, "Stock cannot be negative"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "products",
  }
);

// Indexes
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ title: "text", description: "text" });

// Virtual for formatted price
productSchema.virtual("formattedPrice").get(function () {
  return `$${this.price.toFixed(2)}`;
});

// Methods
productSchema.methods.isInStock = function () {
  return this.stock > 0 && this.isAvailable;
};

productSchema.statics.findByCategory = function (category) {
  return this.find({ category: category.toLowerCase(), isAvailable: true });
};

// Pre-save hook
productSchema.pre("save", function (next) {
  if (this.stock <= 0) {
    this.isAvailable = false;
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
