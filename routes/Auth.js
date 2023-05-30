const express = require("express");
const router = express.Router();
const AuthController = require("../controller/Auth/Auth");
const { Auth } = require("../middlewares/authentication");

router.post("/cmslogin", AuthController.CmsLogin);

router.post("/sendpasswordresetmail");

router.post("/resetpassword");

router.post("/isauth", Auth(), AuthController.isAuth);

module.exports = router;
