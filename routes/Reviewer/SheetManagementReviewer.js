const express = require("express");
const paginatedSheetManagementSheets = require("../../middlewares/paginatedSheetManagementSheets");
const SheetManagementController = require("../../controller/Reviewer/SheetManagement");
const QuestionManagementController = require("../../controller/Uploader2/Question");
const router = express.Router();
const upload = require("../../config/multer");
const questionCount = require("../../middlewares/questionCount");
const { GeneralApi } = require("../../controller/GeneralApi");

router.get("/getallpaginatedsheetmanagement", paginatedSheetManagementSheets(), (req, res) => {
    res.json(res.paginatedResults);
});

router.patch("/updateinprogressstatus", SheetManagementController.updateInProgressTaskStatus)
router.patch("/updatecompletestatus", SheetManagementController.updateCompleteTaskStatus)
router.get("/getquestions", QuestionManagementController.getQuestions);
router.get("/getquestionsstatus", questionCount(), (req, res) => {
    res.json({ allQuestions: res.allQuestions, checkedQuestions: res.checkedQuestions, errorQuestions: res.errorQuestions })
});
router.patch("/checkquestion", SheetManagementController.checkQuestion);
router.patch("/uncheckquestion", SheetManagementController.unCheckQuestion);

router.patch("/seterrorquestion", SheetManagementController.setErrorQuestion);
router.patch("/unseterrorquestion", SheetManagementController.unsetErrorQuestion);

router.patch("/adderrorquestion", upload.single("errorReportFile"), SheetManagementController.addErrorReportToQuestion);
router.patch("/addtopicsubtopicvocaberrorquestion", upload.single("errorReportFile"), SheetManagementController.addTopicSubTopicVocabErrorReportToQuestion);
router.patch("/addhighlighterrorpdf", SheetManagementController.addHighlightPdfToQuestion);

router.get("/highlighterrorpdf", SheetManagementController.getHighlightPdfQuestion);
router.patch("/highlighterrors", SheetManagementController.saveHighlightDataInQuestions);

router.get("/gettopicsubtopicvocabmappingsforquestion", SheetManagementController.getTopicSubTopicVocabMappingsForQuestion);
router.patch("/assigntosupervisor", SheetManagementController.AssignSheetToSupervisor)
router.patch("/addsheeterror", SheetManagementController.reportSheetError);
router.get("/getallSheetbySubjectid", GeneralApi.getAllSheetBySubjectIdandUserId);
router.get("/getallPastPaperbySubjectid", GeneralApi.getAllPastPaperSheetBySubjectIdandUserId);
router.get("/getallPaperNumberbySubjectid", GeneralApi.getAllPaperNoSheetBySubjectIdandUserId);
router.get("/getallBookTasksbySubjectid", GeneralApi.getAllBookSheetBySubjectIdandUserId);
router.get("/getallTopicTasksbySubjectid", GeneralApi.getAllTopicSheetBySubjectIdandUserId);

module.exports = router;