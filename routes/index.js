const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../utils/swagger.json");
const BoardRouters = require("./SuperAdmin/BoardManagement");
const SubjectRouters = require("./Supervisor/SubjectManagement");
const PastPaper = require("./Supervisor/PastPaperManagement");
const PaperNumber = require("./Supervisor/PaperNumberManagement");
const PaperNumberReviewer = require("./Reviewer/PaperNumberReviewer");
const DataGenerator = require("./DataGenerator/DataGenerator");
const AccountManagement = require("./Supervisor/AccountManagement");
const BookManagement = require("./Supervisor/BookManagement");
const PastPaperReviewer = require("./Reviewer/PastPaperReviewer");
const PastPaperUploader = require("./PastPaperUploader/PastPaperUploader");
const topicManagement = require("./Supervisor/TopicManagement");
const topicManagemnetReviewer = require("./Reviewer/TopicManagementReviewer");
const bookManagemnetReviewer = require("./Reviewer/BookManagement");
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
router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
router.use("/auth", Auth);
router.use("/public", PublicRoutes);

router.use("/accountmanagement", AuthSuperadminSupervisor(), AccountManagement);
router.use("/boardmanagement", AuthSuperadmin(), BoardRouters);

router.use("/ppmsupervisor", AuthSuperadminSupervisor(), PastPaper);
router.use("/subjectmanagement", AuthSupervisor(), SubjectRouters);
router.use("/pnmanagement", AuthSupervisor(), PaperNumber);
router.use("/topicmanagement", AuthSupervisor(), topicManagement);
router.use("/bookmanagement", AuthSupervisor(), BookManagement);

router.use("/ppuploader", AuthPastPaper(), PastPaperUploader);

router.use("/datagenerator", AuthDataGenerator(), DataGenerator);

router.use("/pnreviewer", AuthReviewer(), PaperNumberReviewer);
router.use("/ppmreviewer", AuthReviewer(), PastPaperReviewer);
router.use("/tpmreviewer", AuthReviewer(), topicManagemnetReviewer);
router.use("/bkmreviewer", AuthReviewer(), bookManagemnetReviewer );

module.exports = router;
