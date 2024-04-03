const mongoose = require("mongoose");
const crypto = require("crypto");
const { randomUUID } = crypto;

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      trim: true,
      required: true,
      maxlength: 30,
    },
    lastname: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    // about: {
    //   type: String,
    //   trim: true,
    // },
    encry_password: {
      type: String,
    },
    salt: String,
    role: {
      type: Number,
      default: 0,
    },
    purchases: {
      type: Array,
      default: [],
    },
    cart: [
      {
        product: {
          type: mongoose.ObjectId,
          ref: "Product",
          unique: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  { timestamps: true }
);

userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = randomUUID();
    this.encry_password = this.securePass(password);
  })
  .get(function () {
    return this._password;
  });

userSchema.methods = {
  authenticate: function (pass) {
    return this.securePass(pass) === this.encry_password;
  },
  securePass: function (pass) {
    if (!pass) return "";
    try {
      return crypto.createHmac("sha256", this.salt).update(pass).digest("hex");
    } catch (err) {
      return "";
    }
  },
};
module.exports = mongoose.model("User", userSchema);
