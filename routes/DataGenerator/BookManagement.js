const express = require("express");
const BookManagementController = require("../../controller/Supervisor/Book");
const BookManagementDGController = require("../../controller/DataGenerator/BookManagement");
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

router.patch("/setcompletebooktaskstatus");

module.exports = router;
