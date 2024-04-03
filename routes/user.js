const express = require("express");
const { getUserById, getUser, updateUser } = require("../controllers/user");
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const router = express.Router();

router.param("userId", getUserById);

router.get("/user/:userId", isSignedIn, isAuthenticated, getUser);
router.put("/user/update/:userId", isSignedIn, isAuthenticated, updateUser);
// router.get("/user/orders/:userId", isSignedIn, isAuthenticated, usersOrder);

module.exports = router;
