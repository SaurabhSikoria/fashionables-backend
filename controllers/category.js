const Category = require("../models/category");

exports.categoryById = (req, res, next, id) => {
  Category.findById(id)
    .then((data) => {
      req.category = data;
      next();
    })
    .catch((err) => {
      return res.status(400).json({
        error: "Category not found in db",
        err,
      });
    });
};

exports.createCategory = (req, res) => {
  const category = new Category(req.body);
  category
    .save()
    .then((data) => {
      if (!!data)
        return res.status(200).json({
          message: `Category ${category.name} created successfully`,
        });
    })
    .catch((err) => {
      return res.json({
        error: "Not created due to :" + err,
      });
    });
};

exports.getCategory = (req, res) => {
  return res.json(req.category);
};

exports.getAllCategory = (req, res) => {
  Category.find()
    .exec()
    .then((data) => {
      return res.json(data);
    })
    .catch((err) => {
      return res.status(400).json({
        error: "No category found",
      });
    });
};

exports.updateCategory = (req, res) => {
  const category = req.category;
  category.name = req.body.name;
  category
    .save()
    .then((data) => {
      if (!!data)
        return res.status(200).json({
          message: `Category ${data.name} updated Successfully`,
        });
    })
    .catch((err) => {
      return res.status(400).json({
        error: "Failed to update the category",
      });
    });
};

exports.removeCategory = (req, res) => {
  const category = req.category;
  category
    .deleteOne()
    .then((data) => {
      return res.json({
        Message: `${category.name} successfully deleted`,
      });
    })
    .catch((err) => {
      return res.status(400).json({
        error: "Failed to delete the category",
        err,
      });
    });
};
