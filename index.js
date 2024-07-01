const mongoose = require("mongoose");
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("DATABASE CONNECTED"))
  .catch((err) => console.log(`DATABASE NOT CONNECTED DUE TO: ${err}`));

const port = 8000;

console.log(__dirname);
app.use(express.json());
app.use(cors());
app.use(cookieParser());

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);

//error handling

app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError")
    return res.status(401).json({
      error: "Unauthorized User: No authorization token was found",
    });

  console.log(err);
  return res.status(500).json({
    error: "Internal Server Error",
  });
});

app.listen(port, () => {
  console.log("App is running on port", port);
});
