const { verifySignUp } = require("../middlewares/verifySignup");
const controller = require("../controllers/auth.controller");
const router = require("express").Router();

router.post(
  "/auth/signup",
  [verifySignUp.checkDuplicateUsernameOrEmail],
  controller.signup
);

router.post("/auth/signin", controller.signin);

module.exports = router;
