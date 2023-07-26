const express = require("express");
const BoardRouters = require("./BoardManagement.js");
const SubjectRouters = require("./SubjectManagement.js");
const PastPaper = require("./PastPaperManagement.js");
const PaperNumber = require("./PaperNumberManagement.js");
const PaperNumberReviewer = require("./PaperNumberReviewer.js");
const DataGenerator = require("./DataGenerator.js");
const AccountManagement = require("./AccountManagement.js");
const PastPaperReviewer = require("./PastPaperReviewer.js");
const PastPaperUploader = require("./PastPaperUploader.js");
const topicManagement = require("./TopicManagement.js");
const PublicRoutes = require("./PublicRoutes.js");
const Auth = require("./Auth.js");
const {
  AuthSuperadmin,
  AuthPastPaper,
  AuthSupervisor,
  AuthSuperadminSupervisor,
  AuthReviewer,
  AuthDataGenerator,
} = require("../middlewares/authentication.js");

const router = express.Router();
router.use("/auth", Auth);
router.use("/public", PublicRoutes);
router.use("/accountmanagement", AuthSuperadminSupervisor(), AccountManagement);
router.use("/boardmanagement", AuthSuperadmin(), BoardRouters);
router.use("/subjectmanagement", AuthSupervisor(), SubjectRouters);
router.use("/ppmsupervisor", AuthSuperadminSupervisor(), PastPaper);
router.use("/ppmreviewer", AuthReviewer(), PastPaperReviewer);
router.use("/ppuploader", AuthPastPaper(), PastPaperUploader);
router.use("/pnmanagement", AuthSupervisor(), PaperNumber);
router.use("/pnreviewer", AuthReviewer(), PaperNumberReviewer);
router.use("/datagenerator", AuthDataGenerator(), DataGenerator);
router.use("/topicmanagement", AuthSupervisor(), topicManagement);

module.exports = router;
