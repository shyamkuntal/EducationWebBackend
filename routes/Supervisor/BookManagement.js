const express = require("express");
const BookManagementController = require("../../controller/Supervisor/Book");
const paginatedBookTasks = require("../../middlewares/paginatedBookTask");
const PastPaperSupervisorController = require("../../controller/Supervisor/PPMSupervisor");
const SubjectManagementController = require("../../controller/Supervisor/ManageSubject");
const BoardManagementController = require("../../controller/SuperAdmin/BoardM");

const router = express.Router();

router.get("/getallpaginatedbooktask", paginatedBookTasks(), (req, res) => {
  res.json(res.paginatedResults);
});

router.post("/createbooktask", BookManagementController.createBookTask);

router.patch("/updatebooktask", BookManagementController.updateBookTask);

router.patch("/assigntasktodatagenerator", BookManagementController.assignTaskToDataGenerator);

router.patch("/assigntasktoreviewer", BookManagementController.assignTaskToReviewer);

router.get("/getallbooktask", BookManagementController.getAllBookTask);

router.get("/getallbookbytaskid", BookManagementController.getAllBookChapterByTaskId);

router.get("/getallbookbybookid", BookManagementController.getAllChapterByBookId);

router.patch("/togglepublishbooktask", BookManagementController.togglePublishBookTask);

router.get("/gettasklogs", BookManagementController.getBookTaskLogs);

router.get("/getallbooks", BookManagementController.getAllBookfromBookTable);

// api/topicmanagement/getuserassignedsubjects
router.get("/getuserassignedsubjects", PastPaperSupervisorController.getUserAssignedSubjects);

// /api/topicmanagement/getsubjectnames
router.get("/subjectnames", PastPaperSupervisorController.getSubjectNames);

// api/topicmanagement/getsubjectnamebyid
router.get("/getsubjectnamebyid", SubjectManagementController.getSubjectNameById);

// api/topicmanagement/getallboards
router.get("/getallboards", BoardManagementController.getAllBoards);

// api/topicmanagement/getsubboardsbyboard
router.get("/getsubboardsbyboard", BoardManagementController.GetSubBoards);

// api/topicmanagement/getsubjectdetailsbyids
router.get(
  "/getsubjectdetailsbyids",
  SubjectManagementController.getSubjectDetailsByBoardSubBoardGrade
);

router.get("/getcountscarddata", BookManagementController.getCountsCardData);

router.patch("/archivebooktask", BookManagementController.ArchiveAllBookDataByTask)
router.patch("/archivebook", BookManagementController.ArchiveBookAndData)
router.patch("/archivechapter", BookManagementController.ArchiveChapter)

module.exports = router;
