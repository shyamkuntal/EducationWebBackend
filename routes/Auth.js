const express = require("express");
const router = express.Router();
const AuthController = require("../controller/Auth/Auth");
const { Auth } = require("../middlewares/authentication");

router.post("/cmslogin", AuthController.CmsLogin);

router.post("/sendpasswordresetemail", AuthController.sendPasswordResetEmail);

router.put("/resetpassword", AuthController.resetPassword);

router.get("/isauth", Auth(), AuthController.isAuth);

module.exports = router;
