const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { getOrders } = require("../controllers/order");
const { getUserById } = require("../controllers/user");

const router = require("express").Router();

router.param("userId", getUserById);

router.get("/order/:userId", isSignedIn, isAuthenticated, getOrders);

module.exports = router;
