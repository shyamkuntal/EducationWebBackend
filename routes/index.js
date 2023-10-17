const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../utils/swagger.json");
const BoardRouters = require("./SuperAdmin/BoardManagement");
const SubjectRouters = require("./Supervisor/SubjectManagement");
const PastPaper = require("./Supervisor/PastPaperManagement");
const PaperNumber = require("./Supervisor/PaperNumberManagement");
const PaperNumberReviewer = require("./Reviewer/PaperNumberReviewer");
const PaperNumberDataGenerator = require("./DataGenerator/PaperNoManagement");
const TopicManagementDataGenerator = require("./DataGenerator/TopicManagement");
const AccountManagement = require("./Supervisor/AccountManagement");
const BookManagement = require("./Supervisor/BookManagement");
const NoticeBoard = require("./Supervisor/NoticeBoard");
const PastPaperReviewer = require("./Reviewer/PastPaperReviewer");
const PastPaperUploader = require("./PastPaperUploader/PastPaperUploader");
const TopicManagement = require("./Supervisor/TopicManagement");
const TopicManagemnetReviewer = require("./Reviewer/TopicManagementReviewer");
const BookManagemnetReviewer = require("./Reviewer/BookManagement");
const SheetManagementReviewer = require('./Reviewer/SheetManagementReviewer')
const BookManagementDataGenerator = require("./DataGenerator/BookManagement");
const SheetManagementSupervisor = require("./Supervisor/SheetManagement");
const QuestionManagementUploader2 = require("./Uploader2/QuestionManagement");
const TeacherSheetManagement = require("./Teacher/SheetManagement");
const PricerSheetManagement = require("./Pricer/SheetManagement");
const PublicRoutes = require("./PublicRoutes.js");
const SupervisorDashboard = require("./Supervisor/DashBoard");
const Notice = require("./Supervisor/NoticeBoard");
const Archive = require("./Supervisor/ArchiveMangement");
const Auth = require("./Auth.js");
const {
  AuthSuperadmin,
  AuthPastPaper,
  AuthSupervisor,
  AuthSuperadminSupervisor,
  AuthReviewer,
  AuthDataGenerator,
  AuthUploader2,
  AuthTeacher,
  AuthPricer,
} = require("../middlewares/authentication.js");

const router = express.Router();
router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
router.use("/auth", Auth);
router.use("/public", PublicRoutes);

router.use("/accountmanagement", AuthSuperadminSupervisor(), AccountManagement);
router.use("/boardmanagement", AuthSuperadmin(), BoardRouters);

router.use("/supervisordashboard", AuthSupervisor(), SupervisorDashboard);
router.use("/notice", AuthSupervisor(), Notice);

router.use("/archivemanagement", AuthSupervisor(), Archive);
router.use("/ppmsupervisor", AuthSuperadminSupervisor(), PastPaper);
router.use("/subjectmanagement", AuthSupervisor(), SubjectRouters);
router.use("/pnmanagement", AuthSupervisor(), PaperNumber);
router.use("/topicmanagement", AuthSupervisor(), TopicManagement);
router.use("/bookmanagement", AuthSupervisor(), BookManagement);

router.use("/ppuploader", AuthPastPaper(), PastPaperUploader);

router.use("/datagenerator", AuthDataGenerator(), PaperNumberDataGenerator);
router.use("/tpmdatagenerator", AuthDataGenerator(), TopicManagementDataGenerator);
router.use("/bmdatagenerator", AuthDataGenerator(), BookManagementDataGenerator);

router.use("/pnreviewer", AuthReviewer(), PaperNumberReviewer);
router.use("/ppmreviewer", AuthReviewer(), PastPaperReviewer);
router.use("/tpmreviewer", AuthReviewer(), TopicManagemnetReviewer);
router.use("/bkmreviewer", AuthReviewer(), BookManagemnetReviewer);
router.use("/shmreviewer", AuthReviewer(), SheetManagementReviewer);

router.use("/shmsupervisor", AuthSupervisor(), SheetManagementSupervisor);
router.use("/shmuploader", AuthUploader2(), QuestionManagementUploader2);

router.use("/shmteacher", AuthTeacher(), TeacherSheetManagement);

router.use("/shmpricer", AuthPricer(), PricerSheetManagement);

module.exports = router;
