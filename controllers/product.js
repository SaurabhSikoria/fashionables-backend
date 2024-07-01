const formidable = require("formidable");
const { readFileSync } = require("node:fs");
const _ = require("lodash");
const Product = require("../models/product");

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .then((data) => {
      if (!!data) req.product = data;
      next();
    })
    .catch((err) => {
      return res.status(400).json({
        error: "Product not Found in DataBase",
      });
    });
};

exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "The files are not uploaded",
      });
    }
    const fieldValues = {};

    if (fields) {
      for (const key in fields) fieldValues[key] = fields[key][0];
    }

    const { price, name, description, category, stock } = fieldValues;
    if (!name || !price || !description || !category || !stock) {
      return res.status(400).json({
        error: "The fields are misssing",
      });
    }

    let product = new Product(fieldValues);
    if (file.picture) {
      if (file.picture[0].size > 2098000) {
        return res.status(400).json({
          error: " file size too big",
        });
      }
      product.picture.data = readFileSync(file.picture[0].filepath);
      product.picture.contentType = file.picture[0].mimetype;
    }

    product
      .save()
      .then((data) => {
        res.status(200).json({
          msg: data.name + "created Successfully!",
        });
      })
      .catch((err) => {
        return res.status(400).json({
          error: "The product was not created!",
          err,
        });
      });
  });
};

exports.getAllProducts = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);
    Product.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .then((data) =>
        res.json({ products: data, totalPages, currentPage: page })
      )
      .catch((err) =>
        res.status(400).json({
          error: "Unable to fetch Product!",
          err,
        })
      );
  } catch (error) {
    res.status(400).json({
      error: "No Product Found",
      err,
    });
  }
};

exports.getOneProduct = (req, res) => res.json(req.product);

exports.removeProduct = (req, res) => {
  const product = req.product;
  product
    .deleteOne()
    .then((data) =>
      res.status(200).json({
        msg: `${data.name} has been Deleted Successfully!`,
      })
    )
    .catch((err) =>
      res.status(400).json({
        error: `Product Deletion Failed due to: ${err}`,
      })
    );
};

exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "The files are not uploaded",
      });
    }

    const fieldvalues = {};

    if (fields) {
      for (let key in fields) fieldvalues[key] = fields[key][0];
    }

    let product = req.product;
    product = _.extend(product, fieldvalues);

    if (file?.picture) {
      if (file.picture[0].size > 2098000) {
        return res.status(400).json({
          error: " file size too big",
        });
      }
      product.picture.data = readFileSync(file.picture[0].filepath);
      product.picture.contentType = file.picture[0].mimetype;
    }

    product
      .save()
      .then((data) => {
        res.status(200).json({
          msg: data.name + "created Successfully!",
        });
      })
      .catch((err) => {
        return res.status(400).json({
          error: "The product was not created!",
          err,
        });
      });
  });
};
