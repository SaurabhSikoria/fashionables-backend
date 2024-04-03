const router = require("express").Router();
const { check } = require("express-validator");

const { signup, signin, signout } = require("../controllers/auth");

router.post(
  "/signup",
  [
    check("firstname", "The name should be of min 2 char").isLength({ min: 2 }),
    check("phone", "phone no. not valid").optional().isMobilePhone(),
    check("email", "Entry should be an email").isEmail(),
    check("password", "The Password should be of atleast 6 char").isLength({
      min: 6,
    }),
  ],
  signup
);

router.post(
  "/signin",
  [
    check("email", "Entry should be an email").optional().isEmail(),
    check("phone", "phone no. not valid").optional().isMobilePhone(),
    check("password", "Password field is required").isLength({ min: 6 }),
  ],
  signin
);

router.get("/signout", signout);

module.exports = router;
