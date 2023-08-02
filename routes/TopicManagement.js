const express = require("express");
const TopicManagementController = require("../controller/TopicManagement/TopicManagement");
const PastPaperSupervisorController = require("../controller/PastPaperManagement/PPMSupervisor");
const SubjectManagementController = require("../controller/SubjectManagement/ManageSubject");
const BoardManagementController = require("../controller/BoardManagement/BoardM");
const paginatedTopicTasks = require("../middlewares/paginatedTopicTasks");

const router = express.Router();

// /api/topicmanagement/createtopictask
router.post("/createtopictask", TopicManagementController.createTopicTask);

// /api/topicmanagement/getalltopictasks
router.get("/getalltopictasks", paginatedTopicTasks(), (req, res) => {
  res.json(res.paginatedResults);
});

// /api/topicmanagement/getalltopicsubtopicvocab
router.get("/getalltopicsubtopicvocab", TopicManagementController.getAllTopicSubTopicVocab);

// /api/topicmanagement/gettopicsubtopicvocabbytopictaskid
router.get(
  "/gettopicsubtopicvocabbytopictaskid",
  TopicManagementController.getTopicSubTopicVocabByTaskId
);

// /api/topicmanagement/gettopicsubtopicvocabbytopictaskidtopicid
router.get(
  "/gettopicsubtopicvocabbytopictaskidtopicid",
  TopicManagementController.getTopicSubTopicVocabByTaskIdTopicId
);

// /api/topicmanagement/updatetopictask
router.put("/updatetopictask", TopicManagementController.updateTopicTask);

// /api/topicmanagement/assigntasktodatagenerator
router.patch("/asssigntasktodatagenerator", TopicManagementController.assignTaskToDataGenerator);

// /api/topicmanagement/assigntasktoreviewer
router.patch("/assigntasktoreviewer", TopicManagementController.assignTaskToReviewer);

// /api/topicmanagement/togglepublishtask
router.patch("/togglepublishtask", TopicManagementController.togglePublishTopicTask);

// /api/topicmanagement/gettasklogs
router.get("/gettasklogs", TopicManagementController.getTopiTaskLogs);

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

// /api/topicmanagement/gettopictaskbyid
router.get("/gettopictaskbyid", TopicManagementController.getTopicTaskById);

// /api/topicmanagement/geterrorreportfile
router.get("/geterrorreportfile", TopicManagementController.getErrorReportFile);

module.exports = router;
