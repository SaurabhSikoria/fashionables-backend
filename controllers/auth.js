const User = require("../models/user");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { expressjwt } = require("express-jwt");

exports.signup = (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({
      error: result.array()[0].msg,
    });
  }
  const user = new User(req.body);
  user
    .save()
    .then((user) =>
      res.status(200).json({
        msg: `${user.firstname}, You've signed up Successfully`,
      })
    )
    .catch((err) => {
      res.status(400).json({
        error: err,
      });
    });
};

exports.signin = (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({
      error: result.array()[0].msg,
    });
  }
  const { email, password } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          error: "User email is not present",
        });
      }
      if (!user.authenticate(password)) {
        return res.status(401).json({
          error: "The password is incorrect",
        });
      }
      const token = jwt.sign({ _id: user._id }, process.env.SECRET);
      res.cookie("token", token, { expire: new Date() + 9990 });
      const { _id, email, firstname, lastname, role } = user;
      return res.json({
        token,
        user: {
          _id,
          email,
          // name: firstname + " " + lastname,
          firstname: firstname,
          lastname: lastname,
          role,
        },
      });
    })
    .catch((err) => {
      res.json({ error: err + "in catch" });
    });
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    msg: "User Signout Successful",
  });
};

//Middlewares

exports.isAuthenticated = (req, res, next) => {
  let check = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!check) {
    return res.status(403).json({
      error: `Access Denied ${req.profile}`,
    });
  }
  next();
};

exports.isSignedIn = expressjwt({
  secret: process.env.SECRET,
  algorithms: ["HS256"],
  // audience: 'http://localhost:8000/api/'
});

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: `Access Denied. Not an Admin!`,
    });
  }
  next();
};
