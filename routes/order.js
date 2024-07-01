const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const {
  getOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getOrderById,
} = require("../controllers/order");
const { getUserById } = require("../controllers/user");

const router = require("express").Router();

router.param("userId", getUserById);
router.param("orderId", getOrderById);

router.get("/orders", getAllOrders);
router.get("/order/:userId", isSignedIn, isAuthenticated, getOrders);

router.put(
  "/orders/:userId/:orderId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateOrderStatus
);

router.delete(
  "/orders/:userId/:orderId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteOrder
);

module.exports = router;
