const express = require("express");
const PastPaperSupervisorController = require("../../controller/Supervisor/PPMSupervisor");
const BoardManagementController = require("../../controller/SuperAdmin/BoardM.js");
const SubjectManagementController = require("../../controller/Supervisor/ManageSubject.js");
const paginatedSheetManagementSheets = require("../../middlewares/paginatedSheetManagementSheets");
const TopicManagementController = require("../../controller/Supervisor/TopicManagement");
const TeacherSheetManagementController = require("../../controller/Teacher/SheetMangement");
const QuestionManagementController = require("../../controller/Uploader2/Question");
const router = express.Router();
const upload = require("../../config/multer");


router.get("/getassignedsubjects", PastPaperSupervisorController.getUserAssignedSubjects);
router.get("/getsubjectnames", PastPaperSupervisorController.getSubjectNames);
router.get("/getallboards", BoardManagementController.getAllBoards);
router.get("/getallsubboards", BoardManagementController.GetSubBoards);
router.get("/getsubjectdetailsbyids", SubjectManagementController.getSubjectDetailsByBoardSubBoardGrade);
router.get("/getsubjectbysubjectnameid", SubjectManagementController.getSubjectBySubjectNameId);

router.get("/getallshmsheets", paginatedSheetManagementSheets(), (req, res) => {
  res.json(res.paginatedResults);
});

router.patch("/updateinprogressstatus", TeacherSheetManagementController.updateInProgressTaskStatus)
router.patch("/updatecompletestatus", TeacherSheetManagementController.updateCompletedTaskStatus)
router.patch("/assigntosupervisor", TeacherSheetManagementController.SubmitSheetToSupervisor)
router.patch("/addCheckCommentInSheet", TeacherSheetManagementController.addCheckCommentInSheet)

router.get("/getalltopicsubtopicvocab", TopicManagementController.getAllTopicSubTopicVocab);

router.post("/createtopicsubtopicmapping", TeacherSheetManagementController.createTopicSubTopicMappingForQuestion);
router.post("/edittopicsubtopicmapping", TeacherSheetManagementController.editTopicSubTopicMappingForQuestion);
router.post("/createvocabmapping", TeacherSheetManagementController.createVocabMappingForQuestion);
router.post("/editvocabmapping", TeacherSheetManagementController.editVocabMapping);
router.get("/gettopicsubtopicvocabmappingsforquestion", TeacherSheetManagementController.getTopicSubTopicVocabMappingsForQuestion);
router.get("/getquestions", QuestionManagementController.getQuestions);

router.patch("/editquestion", QuestionManagementController.editQuestion);

router.patch("/markquestionaserror", TeacherSheetManagementController.markQuestionAsError);
router.patch("/markquestionaschecked", TeacherSheetManagementController.markQuestionAsChecked);
router.patch("/removequestionaserror", TeacherSheetManagementController.removeQuestionAsError);
router.patch("/removequestionaschecked", TeacherSheetManagementController.removeQuestionAsChecked);

router.patch("/addhighlighterrorpdf", upload.single("file"), TeacherSheetManagementController.addHighlightPdfToQuestion);
router.get("/highlighterrorpdf", TeacherSheetManagementController.getHighlightPdfQuestion);
router.patch("/highlighterrors", TeacherSheetManagementController.saveHighlightDataInQuestions);


module.exports = router;