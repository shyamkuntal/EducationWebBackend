const express = require("express");
const BoardRouters = require("./BoardManagement.js");
const SubjectRouters = require("./SubjectManagement.js");
const PPMSupervisor = require("./PPMSupervisor.js");
const AccountManagement = require("./AccountManagement.js");
const PPMReviewer = require("./PastPaperReviewer.js");
const PastPaperUploader = require("./PastPaperUploader.js");
const Auth = require("./Auth.js");
const {
  AuthSuperadmin,
  AuthSupervisor,
} = require("../middlewares/authentication.js");

const router = express.Router();
router.use("/auth", Auth);
router.use("/boardmanagement", AuthSuperadmin(), BoardRouters);
router.use("/subjectmanagement", AuthSupervisor(), SubjectRouters);
router.use("/ppmsupervisor", PPMSupervisor);
router.use("/ppmreviewer", PPMReviewer);
router.use("/accountmanagement", AccountManagement);
router.use("/ppuploader", PastPaperUploader);

module.exports = router;
