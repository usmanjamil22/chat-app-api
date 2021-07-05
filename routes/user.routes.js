const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");
const router = require("express").Router();

router.get("/user/all", [authJwt.verifyToken], controller.allAccess);
router.get("/user/me", [authJwt.verifyToken], controller.userBoard);

module.exports = router;
