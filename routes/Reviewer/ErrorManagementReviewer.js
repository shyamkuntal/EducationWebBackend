const express = require("express");
const paginatedSheetManagementSheets = require("../../middlewares/paginatedSheetManagementSheets");
const SheetManagementController = require("../../controller/Reviewer/SheetManagement");
const PricerSheetManagementController = require("../../controller/Pricer/SheetManagement");
const QuestionManagementController = require("../../controller/Uploader2/Question");
const router = express.Router();
const upload = require("../../config/multer");
const questionCountRecheck = require("../../middlewares/questionCountRecheck");
const ErrorManagementController = require("../../controller/Reviewer/ErrorManagement");

// router.patch("/updateinprogressstatus", SheetManagementController.updateInProgressTaskStatus)
// router.patch("/updatecompletestatus", SheetManagementController.updateCompleteTaskStatus)
// router.get("/getquestions", QuestionManagementController.getQuestions);
router.get("/getquestionsstatus", questionCountRecheck(), (req, res) => {
    res.json({ allQuestions: res.allQuestions, checkedQuestions: res.checkedQuestions, errorQuestions: res.errorQuestions })
});
router.patch("/checkquestion", ErrorManagementController.checkQuestion);
router.patch("/uncheckquestion", ErrorManagementController.unCheckQuestion);

router.patch("/seterrorquestion", ErrorManagementController.setErrorQuestion);
router.patch("/unseterrorquestion", ErrorManagementController.unsetErrorQuestion);
router.get("/sheeterrorsbyreviewer", PricerSheetManagementController.getErrorsForQuestion);

// router.patch("/adderrorquestion", upload.single("errorReportFile"), SheetManagementController.addErrorReportToQuestion);
// router.patch("/addtopicsubtopicvocaberrorquestion", upload.single("errorReportFile"), SheetManagementController.addTopicSubTopicVocabErrorReportToQuestion);
// router.patch("/addhighlighterrorpdf", upload.single("file"), SheetManagementController.addHighlightPdfToQuestion);

// router.get("/highlighterrorpdf", SheetManagementController.getHighlightPdfQuestion);
// router.patch("/highlighterrors", SheetManagementController.saveHighlightDataInQuestions);

// router.get("/gettopicsubtopicvocabmappingsforquestion", SheetManagementController.getTopicSubTopicVocabMappingsForQuestion);
// router.patch("/assigntosupervisor", SheetManagementController.AssignSheetToSupervisor)
// router.patch("/addsheeterror", SheetManagementController.reportSheetError);

module.exports = router;