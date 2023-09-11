const express = require("express");
const paginatedBookTasks = require("../../middlewares/paginatedBookTask");
const BookManagementController = require("../../controller/Supervisor/Book");
const ReviewerBookController = require("../../controller/Reviewer/BookManagement");
const upload = require("../../config/multer");
const BookManagementDGController = require("../../controller/DataGenerator/BookManagement");

const router = express.Router();

router.get("/getallpaginatedbooktask", paginatedBookTasks(), (req, res) => {
  res.json(res.paginatedResults);
});

router.get("/getallbookchapterbytaskid", BookManagementController.getAllBookChapterByTaskId);

router.get("/getallchapterbybookid", BookManagementController.getAllChapterByBookId);

// /api/bkmreviewer/updateinprogresstaskstatus
router.patch(
  "/updateinprogresstaskstatus", ReviewerBookController.updateInProgressTaskStatus
);

// api/tpmreviewer/updatecompletestatus
router.patch("/updatecompletebooktaskstatus", ReviewerBookController.updateCompleteTaskStatus);

router.patch(
  "/reportbooktaskerror",
  upload.single("errorReportFile"),
  ReviewerBookController.addErrorReportToBookTask
);

router.patch("/adderrorstobooks", ReviewerBookController.addErrorsToBooks);

router.patch("/adderrorstochapters", ReviewerBookController.addErrorsToChapters);

router.patch("/submittasktosupervisor", ReviewerBookController.submitTaskToSupervisor);

router.post("/addrecheckcomment", ReviewerBookController.addRecheckComment);

router.get("/getrecheckcomment", ReviewerBookController.getRecheckComment);

router.get("/geterrorreportfile", ReviewerBookController.getErrorReportFile);

router.patch("/setbookinprogressstatus", ReviewerBookController.setBookInProgressStatus);

router.patch("/setbookcompletestatus", ReviewerBookController.setBookCompleteStatus);

module.exports = router;