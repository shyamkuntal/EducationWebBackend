const express = require("express");
const BoardRouters = require("./SuperAdmin/BoardManagement");
const SubjectRouters = require("./Supervisor/SubjectManagement");
const PastPaper = require("./Supervisor/PastPaperManagement");
const PaperNumber = require("./Supervisor/PaperNumberManagement");
const PaperNumberReviewer = require("./Reviewer/PaperNumberReviewer");
const DataGenerator = require("./DataGenerator/DataGenerator");
const AccountManagement = require("./Supervisor/AccountManagement");
const PastPaperReviewer = require("./Reviewer/PastPaperReviewer");
const PastPaperUploader = require("./PastPaperUploader/PastPaperUploader");
const topicManagement = require("./Supervisor/TopicManagement");
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
