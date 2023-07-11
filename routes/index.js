const express = require("express");
const BoardRouters = require("./BoardManagement.js");
const SubjectRouters = require("./SubjectManagement.js");
const PPMSupervisor = require("./PPMSupervisor.js");
const PaperNumber = require("./PaperNumberManagement.js");
const AccountManagement = require("./AccountManagement.js");
const PPMReviewer = require("./PastPaperReviewer.js");
const PastPaperUploader = require("./PastPaperUploader.js");
const PublicRoutes = require("./PublicRoutes.js");
const Auth = require("./Auth.js");
const {
  AuthSuperadmin,
  AuthPastPaper,
  AuthSupervisor,
  AuthSuperadminSupervisor,
} = require("../middlewares/authentication.js");

const router = express.Router();
router.use("/auth", Auth);
router.use("/boardmanagement", AuthSuperadmin(), BoardRouters);
router.use("/subjectmanagement", AuthSupervisor(), SubjectRouters);
router.use("/ppmsupervisor", AuthSuperadminSupervisor(), PPMSupervisor);
router.use("/ppmreviewer", PPMReviewer);
router.use("/accountmanagement", AuthSuperadminSupervisor(), AccountManagement);
router.use("/ppuploader", AuthPastPaper(), PastPaperUploader);
router.use("/public", PublicRoutes);
router.use("/pnmanagement", AuthSupervisor(), PaperNumber);

module.exports = router;
