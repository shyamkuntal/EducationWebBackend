const express = require("express");
const BookManagementController = require("../../controller/Supervisor/Book");
const BookManagementDGController = require("../../controller/DataGenerator/BookManagement");
const ReviewerBookController = require("../../controller/Reviewer/BookManagement");
const paginatedBookTasks = require("../../middlewares/paginatedBookTask");
const router = express.Router();

router.get("/getassignedpaginatedbooktask", paginatedBookTasks(), (req, res) => {
  res.json(res.paginatedResults);
});

router.get("/getbooksbybooktaskid", BookManagementController.getAllBookChapterByTaskId);

router.patch("/updatebook", BookManagementDGController.updateBookSubTitleAuthorPublisher);

router.post("/addchapters", BookManagementDGController.addChapters);

router.delete("/deletechapter", BookManagementDGController.deleteChapter);

router.patch("/setbookinprogressstatus", BookManagementDGController.setBookInProgressStatus);

router.patch("/setbookcompletestatus", BookManagementDGController.setBookCompleteStatus);

router.patch(
  "/updateinprogressbooktaskstatus",
  BookManagementDGController.updateInProgressBookTaskStatus
);

router.patch(
  "/updatecompletebooktaskstatus",
  BookManagementDGController.updateCompleteBookTaskStatus
);

router.patch("/submittasktosupervior", BookManagementDGController.submitTaskToSupervisor);

router.patch("/updatechapter", BookManagementDGController.updateChapter);

router.get("/geterrorreportfile", ReviewerBookController.getErrorReportFile);

router.get("/getrecheckcomment", ReviewerBookController.getRecheckComment);

router.get("/getcountscarddata", BookManagementDGController.getCountsCardData);

module.exports = router;
