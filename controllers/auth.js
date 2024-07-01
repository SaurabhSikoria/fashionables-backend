const User = require("../models/user");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { expressjwt } = require("express-jwt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

exports.signup = (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({
      error: result.array()[0].msg,
    });
  }
  const user = new User(req.body);
  user.verificationToken = crypto.randomBytes(20).toString("hex");
  sendVerificationMail(user.email, user.verificationToken);

  user
    .save()
    .then((user) =>
      res.status(200).json({
        msg: `${user.firstname} Registered Successfully! Verify you Account by clicking on verification Link sent to your email!`,
      })
    )
    .catch((err) => {
      res.status(400).json({
        error: "Server error: " + err,
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

const sendVerificationMail = (email, token) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Verify Your Email by Clicking on the Link",
    html: `
    <h1>Email Verification</h1>
    <p>Thank you for registering. Please verify your email by clicking the link below:</p>
    <a href="${process.env.CLIENT_URL}/verify-email/${token}">Verify Email</a>
  `,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Error sending email:", err);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

exports.verifyEmail = (req, res) => {
  const { token } = req.params;

  User.findOne({ verificationToken: token })
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          error: "Invalid Token!",
        });
      }
      user.isVerified = true;
      user.verificationToken = undefined;
      user.save().then((user) => {
        return res.json({
          msg: `${user.firstname} Verified Successfully!`,
        });
      });
    })
    .catch((err) => {
      res.json({ error: err + "Server Error" });
    });
};

exports.requestPasswordRest = (req, res) => {
  const { email } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          error: "Unable to find User",
        });
      }
      user.resetPasswordToken = crypto.randomBytes(20).toString("hex");
      user.resetPasswordExpire = new Date() + 3600000; // 1hour
      user
        .save()
        .then(() => {
          return res.json({
            msg: `Password Reset Link sent to your email!`,
          });
        })
        .catch((err) => {
          res.json({ error: err + "Unable to request Password Reset" });
        });

      // TODO: send email
    })
    .catch((err) => {
      res.json({ error: err + "Server Error" });
    });
};

exports.resetPassword = (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          error: "Invalid Token!",
        });
      }
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      user
        .save()
        .then(() => {
          return res.json({
            msg: `Password has been Reset Successfully!`,
          });
        })
        .catch((err) => {
          res.json({ error: err + "Unable to Reset Password" });
        });
    })
    .catch((err) => {
      res.json({ error: err + "Server Error" });
    });
};

const transporter = nodemailer.createTransport({
  // host: "smtp.gmail.com",
  // port: 465,
  // secure: true,
  // or
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

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
