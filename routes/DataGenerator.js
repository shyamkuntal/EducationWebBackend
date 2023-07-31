const express = require("express");
const upload = require("../config/multer.js");
const PastPaperSupervisorController = require("../controller/PastPaperManagement/PPMSupervisor.js");
const BoardManagementController = require("../controller/BoardManagement/BoardM.js");
const DataGeneratorController = require("../controller/DataGenerator/DataGeneratorManagement.js");
const paginatedPaperNumberSheet = require("../middlewares/paginatedPaperNumber.js");
const { PaperNumberSheet } = require("../models/PaperNumberSheet.js");
const SubjectManagementController = require("../controller/SubjectManagement/ManageSubject.js");
const PaperNumberReviewerController = require("../controller/PaperNumberReviewer/PaperNumberReviewer.js");
const paginatedTopicTasks = require("../middlewares/paginatedTopicTasks.js");
const TopicManagementController = require("../controller/TopicManagement/TopicManagement.js");

const router = express.Router();

router.get("/getallPaperNumberSheets", paginatedPaperNumberSheet(PaperNumberSheet), (req, res) => {
    res.json(res.paginatedResults);
});

router.get(
    "/getpapernumberbypnsheetid",
    DataGeneratorController.getPaperNumberByPaperNumberSheet
);

router.post("/createpapernumber", DataGeneratorController.createPaperNumber);

router.patch("/updatepapernumber", DataGeneratorController.EditPaperNumber);

router.post("/deletepapernumber", DataGeneratorController.deletePaperNumber);

router.get("/getallPaperNumber", DataGeneratorController.getAllPaperNumber);

router.get("/getassignedsubjects", PastPaperSupervisorController.getUserAssignedSubjects);

router.get("/getsubjectnames", PastPaperSupervisorController.getSubjectNames);

router.get("/getallboards", BoardManagementController.getAllBoards);

router.get("/getallsubboards", BoardManagementController.GetSubBoards);

router.get(
    "/getsubjectdetailsbyids",
    SubjectManagementController.getSubjectDetailsByBoardSubBoardGrade
);

router.get(
    "/getsubjectbysubjectnameid",
    SubjectManagementController.getSubjectBySubjectNameId
);

router.patch("/submittosupervisor", DataGeneratorController.SubmitToSupervisor);

router.patch("/markitasinprogress", DataGeneratorController.MarkitasInProgress);

router.patch("/markitascomplete", DataGeneratorController.Markitascomplete);

router.get("/getallpapernumber", DataGeneratorController.getAllPaperNumber);

// api/pnreviewer/getrecheckcomment
router.get("/getrecheckcomment", DataGeneratorController.getRecheckComment);

// api/pnreviewer/geterrorreportfile
router.get("/geterrorreportfile", PaperNumberReviewerController.getErrorReportFile);

// /api/topicmanagement/getalltopictasks
router.get("/getalltopictasks", paginatedTopicTasks(), (req, res) => {
    res.json(res.paginatedResults);
});


// ********** Topic Routes ************** //


router.post("/createtopic", DataGeneratorController.createTopic);

router.post("/createsubtopic", DataGeneratorController.createSubTopic);

router.post("/createvocabulary", DataGeneratorController.createVocabulary);

router.patch("/submitopictasktosupervisor", DataGeneratorController.SubmitTopicTaskToSupervisor);

// /api/topicmanagement/getalltopicsubtopicvocab
router.get("/getalltopicsubtopicvocab", TopicManagementController.getAllTopicSubTopicVocab);

// /api/topicmanagement/gettopicsubtopicvocabbytopictaskid
router.get(
  "/gettopicsubtopicvocabbytopictaskid",
  TopicManagementController.getTopicSubTopicVocabByTaskId
);

// /api/topicmanagement/getsubtopicvocabbytopicid
router.get(
  "/getsubtopicvocabbytopicid",
  TopicManagementController.getSubTopicVocabByTopicId
);

// /api/topicmanagement/getsubtopicvocabbytopicid
router.get(
  "/getsubtopicvocabbytaskid",
  TopicManagementController.getSubTopicVocabByTaskId
);


module.exports = router; 