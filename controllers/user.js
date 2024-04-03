const mongoose = require("mongoose");
const User = require("../models/user");
const formidable = require("formidable");

exports.getUserById = (req, res, next, id) => {
  User.findById(id)
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          error: "No user was found",
        });
      }
      req.profile = {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        purchases: user.purchases,
        cart: user.cart,
      };
      next();
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({
          error: "Invalid User ID",
        });
      } else {
        console.log("User Error", err);
      }
    });
};

exports.getUser = (req, res) => {
  return res.json(req.profile);
};

exports.updateUser = (req, res) => {
  let form = new formidable.IncomingForm();
  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        error: "The files are not uploaded",
      });
    }
    const fieldValues = {};

    if (fields) {
      for (const key in fields) fieldValues[key] = fields[key][0];
    }

    User.findByIdAndUpdate(
      { _id: req.profile._id },
      { $set: fieldValues },
      { new: true, useFindAndModify: false }
    )
      .then((user) => {
        if (!!user) {
          return res.json(user);
        }
      })
      .catch((err) => console.log(err, "NOT AUTHORIZED"));
  });
};

exports.addToCart = (req, res) => {
  User.findByIdAndUpdate(
    { _id: req.profile._id },
    { $addToSet: { cart: { product: req.product._id, quantity: 1 } } },
    { new: true }
  )
    .then((user) => {
      if (user) {
        return res.json(user.cart);
      }
    })
    .catch((err) =>
      res.status(400).json({
        error: err,
      })
    );
};

exports.getCart = (req, res) => res.json(req.profile.cart);

exports.removeFromCart = (req, res) => {
  User.findByIdAndUpdate(
    { _id: req.profile._id },
    { $pull: { cart: { product: req.product._id } } },
    { new: true }
  )
    .then((user) => res.json(user.cart))
    .catch((err) =>
      res.status(400).json({
        error: err,
      })
    );
};

exports.removeAllFromCart = (req, res) => {
  User.findByIdAndUpdate(
    { _id: req.profile._id },
    { $set: { cart: [] } }, // Set the cart array to an empty array
    { new: true }
  )
    .then((user) => res.json(user.cart))
    .catch((err) =>
      res.status(400).json({
        error: err,
      })
    );
};

exports.cartMiddle = async (req, res, next, id) => {
  const user = await User.findById(req.profile._id, { cart: 1 });
  console.log("id sent" + id);
  const item = user.cart.find((item) => {
    console.log("searching" + item._id);
    return item._id.toString() === id;
  });
  console.log(item);
  req.cart = item;
  next();
};

exports.updateCart = (req, res) => {
  User.findByIdAndUpdate(
    { _id: req.profile._id, "cart.product": req.product._id },
    { $inc: { "cart.$[item].quantity": req.body.quantity } },
    { new: true, arrayFilters: [{ "item.product": req.product._id }] }
  )
    .then((user) => {
      if (user) {
        return res.json(user.cart);
      }
    })
    .catch((err) =>
      res.status(400).json({
        error: err,
      })
    );
};
