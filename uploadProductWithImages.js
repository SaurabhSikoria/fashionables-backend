const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
//run this in command line
//node uploadProductsWithImages.js

// MongoDB connection
mongoose.connect(
  "mongodb+srv://<username>:<password>@cluster0.mongodb.net/yourdatabase",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Define your Product schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  image: Buffer, // Store image as binary data
});

const Product = mongoose.model("Product", productSchema);

// Load your JSON file
const loadProducts = () => {
  return JSON.parse(fs.readFileSync("products.json", "utf-8"));
};

// Convert image file to binary data
const convertImageToBinary = (imagePath) => {
  return fs.readFileSync(imagePath);
};

// Upload products to the database
const uploadProducts = async () => {
  const products = loadProducts();

  try {
    for (const product of products) {
      // Assuming images are named like 'product1.jpg', 'product2.jpg', etc.
      const imageName = product.name.toLowerCase().replace(/ /g, "") + ".jpg";
      const imagePath = path.join(__dirname, "images", imageName);

      if (fs.existsSync(imagePath)) {
        product.image = convertImageToBinary(imagePath);
      } else {
        console.warn(`Image for ${product.name} not found!`);
      }

      const newProduct = new Product(product);
      await newProduct.save();
      console.log(`Product ${product.name} saved!`);
    }
    console.log("All products have been uploaded.");
  } catch (error) {
    console.error("Error uploading products:", error);
  } finally {
    mongoose.connection.close();
  }
};

uploadProducts();
