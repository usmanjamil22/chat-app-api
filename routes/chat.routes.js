const { authJwt } = require("../middlewares");
const router = require('express').Router();
const controller = require('../controllers/chat.controller');

router.post('/chat', [authJwt.verifyToken], controller.startChat);
router.post('/group-chat', [authJwt.verifyToken], controller.createGroupChat);
router.post('/group-chat/join', [authJwt.verifyToken], controller.joinGroupChat);
router.post('/message/send', [authJwt.verifyToken], controller.sendMessage);

module.exports = router;