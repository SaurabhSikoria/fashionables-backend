const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const {
  getProductById,
  createProduct,
  getAllProducts,
  getOneProduct,
  removeProduct,
  updateProduct,
} = require("../controllers/product");
const {
  getUserById,
  addToCart,
  getCart,
  removeFromCart,
  updateCart,
  cartMiddle,
  removeAllFromCart,
} = require("../controllers/user");
const {
  braintreeGatewayToken,
  braintreePaymentGateway,
} = require("../controllers/gateway");

const router = require("express").Router();

router.param("userId", getUserById);
router.param("productId", getProductById);
router.param("cartId", cartMiddle);

router.post(
  "/product/create/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  createProduct
);
router.get("/products", getAllProducts);
router.get("/product/:productId", getOneProduct);

router.delete(
  "/product/:userId/:productId",
  isSignedIn,
  isAuthenticated,
  removeProduct
);
router.put(
  "/product/:userId/:productId",
  isSignedIn,
  isAuthenticated,
  updateProduct
);

router.post("/cart/:userId/:productId", isSignedIn, isAuthenticated, addToCart);
router.delete(
  "/cart/:userId/:productId",
  isSignedIn,
  isAuthenticated,
  removeFromCart
);
router.delete("/cart/:userId", isSignedIn, isAuthenticated, removeAllFromCart);
router.put("/cart/:userId/:productId", isSignedIn, isAuthenticated, updateCart);
router.get("/cart/:userId", isSignedIn, isAuthenticated, getCart);

router.get(
  "/:userId/braintree/token/",
  isSignedIn,
  isAuthenticated,
  braintreeGatewayToken
);
router.post(
  "/:userId/braintree/payment",
  isSignedIn,
  isAuthenticated,
  braintreePaymentGateway
);

module.exports = router;
