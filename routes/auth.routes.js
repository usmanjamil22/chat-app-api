const {checkDuplicateUsernameOrEmail} = require("../middlewares/verifySignup");
const controller = require("../controllers/auth.controller");
const router = require("express").Router();

router.route("/auth/signup").post(
  checkDuplicateUsernameOrEmail,
  controller.signup
);

router.post("/auth/signin", controller.signin);

module.exports = router;
