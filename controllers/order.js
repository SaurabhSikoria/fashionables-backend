const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");

exports.getOrderById = (req, res, next, id) => {
  Order.findById(id)
    .then((order) => {
      req.order = order;
      next();
    })
    .catch((err) => {
      return res.status(400).json({
        error: "Order not found",
      });
    });
};

exports.getAllOrders = (req, res) => {
  Order.find()
    .select("user products transaction_id amount status")
    .populate({
      path: "user",
      select: "name email",
    })
    .populate({
      path: "products.product",
      select: "-picture",
    })
    .then((data) => res.json(data))
    .catch((err) =>
      res.json({
        error: `Something went wrong! ${err}`,
      })
    );
};

exports.getOrders = (req, res) => {
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
};

exports.updateOrderStatus = (req, res) => {
  Order.findByIdAndUpdate(
    req.order._id,
    { status: req.body.status },
    { new: true, runValidators: true }
  )
    .select("user products transaction_id amount status")
    .populate("user", "name email")
    .populate("products.product", "name price")
    .then((data) => res.status(200).json(data))
    .catch((err) =>
      res.status(400).json({
        error: `Unable to change order status! ${err}`,
      })
    );
};

exports.deleteOrder = (req, res) => {
  Order.deleteOne({ _id: req.order._id })
    .then((data) => res.status(200).json(data))
    .catch((err) =>
      res.status(400).json({
        error: `Unable to delete order! ${err}`,
      })
    );
};
