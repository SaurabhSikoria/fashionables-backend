const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const {
  categoryById,
  getCategory,
  getAllCategory,
  createCategory,
  updateCategory,
  removeCategory,
} = require("../controllers/category");
const { getUserById } = require("../controllers/user");

const router = require("express").Router();

router.param("userId", getUserById);
router.param("categoryId", categoryById);

router.get("/category/:categoryId", getCategory);
router.get("/categories", getAllCategory);
router.post(
  "/category/create/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  createCategory
);
router.put(
  "/category/:userId/:categoryId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateCategory
);
router.delete(
  "/category/:userId/:categoryId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  removeCategory
);
module.exports = router;
