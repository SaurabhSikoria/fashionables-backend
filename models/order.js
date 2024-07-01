const mongoose = require("mongoose");

// const cartproductSchema = new mongoose.Schema({
//   product: {
//     type: mongoose.ObjectId,
//     ref: "Product",
//   },
//   count: Number,
//   name: String,
//   price: Number,
// });

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.ObjectId,
          ref: "Product",
        },
        // quantity: {
        //   type: Number,
        //   default: 1,
        // },
      },
    ],
    transaction_id: String,
    amount: Number,
    address: String,
    status: {
      type: String,
      default: "recieved",
      enum: ["cancelled", "delivered", "shipped", "pending"],
    },
    updated: Date,
    user: {
      type: mongoose.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// const Cartproduct = mongoose.model("Cartproduct", cartproductSchema);
module.exports = mongoose.model("Order", orderSchema);

// module.exports = { Order, Cartproduct };
