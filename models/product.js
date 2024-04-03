const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 30,
    },
    description: {
      type: String,
      trim: true,
      required: true,
      maxlength: 200,
    },
    price: {
      type: Number,
      required: true,
      maxlength: 30,
      trim: true,
    },
    category: {
      type: mongoose.ObjectId,
      ref: "Category",
      require: true,
    },
    stock: Number,
    sold: {
      type: Number,
      default: 0,
    },
    picture: {
      data: Buffer,
      contentType: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
