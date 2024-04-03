const Order = require("../models/order");
const Product = require("../models/product");

exports.getOrders = (req, res) => {
  try {
    Order.find({ user: req.profile._id })
      .then((data) => {
        const promise = data.map((order) => {
          return Promise.all(
            order.products.map((productId) => Product.findOne(productId))
          )
            .then((data) => {
              order.products = data;
              return order;
            })
            .catch((err) => {
              console.log(err);
              return order;
            });
        });

        return Promise.all(promise)
          .then((updatedOrder) => {
            return res.status(200).json(updatedOrder);
          })
          .catch((err) => {
            console.log(err);
            return res.status(500).json({ error: "Internal Server error" });
          });
      })
      .catch((err) => res.status(400).json(err));
  } catch (error) {
    console.log(error);
  }
};
