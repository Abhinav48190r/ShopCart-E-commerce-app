require("dotenv").config();
const axios = require("axios");
const connectDB = require("../config/db");
const Product = require("../models/Product");

/**
 * Seed products from Fake Store API to MongoDB
 */
const seedProducts = async () => {
  try {
    console.log("\n════════════════════════════════════════");
    console.log("🌱 SEEDING PRODUCTS FROM FAKE STORE API");
    console.log("════════════════════════════════════════\n");

    // Connect to database
    await connectDB();

    // Clear existing products
    console.log("🗑️  Clearing existing products...");
    await Product.deleteMany({});
    console.log("✅ Existing products cleared\n");

    // Fetch products from Fake Store API
    console.log("📡 Fetching products from Fake Store API...");
    const response = await axios.get(`${process.env.FAKE_STORE_API}/products`, {
      timeout: 15000,
    });

    const products = response.data;
    console.log(`✅ Fetched ${products.length} products\n`);

    // Insert products into database
    console.log("💾 Saving products to database...");
    const savedProducts = await Product.insertMany(products);
    console.log(`✅ Successfully saved ${savedProducts.length} products\n`);

    // Display summary
    console.log("════════════════════════════════════════");
    console.log("📊 SEEDING SUMMARY");
    console.log("════════════════════════════════════════");
    console.log(`Total Products: ${savedProducts.length}`);

    // Count by category
    const categories = {};
    savedProducts.forEach((product) => {
      categories[product.category] = (categories[product.category] || 0) + 1;
    });

    console.log("\nProducts by Category:");
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count}`);
    });

    console.log("\nPrice Range:");
    const prices = savedProducts.map((p) => p.price);
    console.log(`  - Min: $${Math.min(...prices).toFixed(2)}`);
    console.log(`  - Max: $${Math.max(...prices).toFixed(2)}`);
    console.log(
      `  - Avg: $${(prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(
        2
      )}`
    );

    console.log("\n════════════════════════════════════════");
    console.log("✅ SEEDING COMPLETED SUCCESSFULLY!");
    console.log("════════════════════════════════════════\n");

    process.exit(0);
  } catch (error) {
    console.error("\n════════════════════════════════════════");
    console.error("❌ SEEDING FAILED!");
    console.error("════════════════════════════════════════");
    console.error("Error:", error.message);

    if (error.response) {
      console.error("API Response Status:", error.response.status);
      console.error("API Response Data:", error.response.data);
    }

    console.error("════════════════════════════════════════\n");
    process.exit(1);
  }
};

// Run seeding
seedProducts();
