const express = require("express");
const router = express.Router();
const TopicManagementReviewerController = require("../../controller/Reviewer/TopicManagementReviewer/TopicManagementReviewer");
const SubjectManagementController = require("../../controller/Supervisor/SubjectManagement/ManageSubject");
const BoardManagementController = require("../../controller/SuperAdmin/BoardManagement/BoardM.js");
const PastPaperSupervisorController = require("../../controller/Supervisor/PastPaperManagement/PPMSupervisor");
const upload = require("../../config/multer");
const paginatedTopicTasks = require("../../middlewares/paginatedTopicTasks");

// /api/tpmreviewer/getsheets
router.get("/getallsheets", paginatedTopicTasks(), (req, res) => {
  res.json(res.paginatedResults);
});

// /api/tpmreviewer/updateinprogresstaskstatus
router.patch(
  "/updateinprogresstaskstatus",
  TopicManagementReviewerController.updateInProgressTaskStatus
);

// api/tpmreviewer/reporttopictaskerror
router.patch(
  "/reporttopictaskerror",
  upload.single("errorReportFile"),
  TopicManagementReviewerController.addErrorReportToTopicTask
);

// api/tpmreviewer/adderrorstotopics
router.patch("/adderrorstotopics", TopicManagementReviewerController.addErrorsToTopics);

// api/tpmreviewer/adderrorstosubtopics
router.patch("/adderrorstosubtopics", TopicManagementReviewerController.addErrorsToSubTopics);

// api/tpmreviewer/adderrorstovocab
router.patch("/adderrorstovocab", TopicManagementReviewerController.addErrorsToVocabulary);

// api/tpmreviewer/updatecompletestatus
router.patch("/updatecompletestatus", TopicManagementReviewerController.updateCompleteTaskStatus);

// api/tpmreviewer/submittasktosupervisor
router.patch("/submittasktosupervisor", TopicManagementReviewerController.submitTaskToSupervisor);

// api/tpmreviewer/addrecheckcomment
router.post("/addrecheckcomment", TopicManagementReviewerController.addRecheckComment);

// api/tpmreviewer/getrecheckcomment
router.get("/getrecheckcomment", TopicManagementReviewerController.getRecheckComment);

// api/tpmreviewer/geterrorreportfile
router.get("/geterrorreportfile", TopicManagementReviewerController.getErrorReportFile);

// api/tpmreviewer/getsubjectnamebyid
router.get("/getsubjectnamebyid", SubjectManagementController.getSubjectNameById);

// api/pnreviewer/getallboards
router.get("/getallboards", BoardManagementController.getAllBoards);

// api/pnreviewer/getsubboardsbyboard
router.get("/getsubboardsbyboard", BoardManagementController.GetSubBoards);

// api/pnreviewer/getuserassignedsubjects
router.get("/getuserassignedsubjects", PastPaperSupervisorController.getUserAssignedSubjects);

// api/pnreviewer/getsubjectnames
router.get("/getsubjectnames", PastPaperSupervisorController.getSubjectNames);

module.exports = router;
