const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 40,
      unique: true,
    },
    parentCategory: {
      type: mongoose.ObjectId,
      ref: "Category",
    },
    subCategory: [
      {
        type: mongoose.ObjectId,
        ref: "Category",
      },
    ],
  },
  {
    timestamps: true,
  }
);

categorySchema.pre("save", async function (next) {
  if (this.parentCategory) {
    const parentCategory = await this.model("Category").findById(
      this.parentCategory
    );
    if (parentCategory) {
      if (!parentCategory.subCategory.includes(this._id)) {
        parentCategory.subCategory.push(this._id);
        await parentCategory.save();
      }
    }
  }
  next();
});

categorySchema.pre("deleteOne", async function (next) {
  if (this.parentCategory) {
    const parentCategory = await this.model("Category").findById(
      this.parentCategory
    );
    if (parentCategory) {
      parentCategory.subCategory.pop(this._id);
      await parentCategory.save();
    }
  }
  next();
});

module.exports = mongoose.model("Category", categorySchema);
