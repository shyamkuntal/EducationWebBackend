const express = require("express");
const PastPaperSupervisorController = require("../../controller/Supervisor/PPMSupervisor");
const BoardManagementController = require("../../controller/SuperAdmin/BoardM.js");
const SubjectManagementController = require("../../controller/Supervisor/ManageSubject.js");
const paginatedSheetManagementSheets = require("../../middlewares/paginatedSheetManagementSheets");
const PricerSheetManagementController = require("../../controller/Pricer/SheetManagement");
const QuestionManagementController = require("../../controller/Uploader2/Question");
const { GeneralApi } = require("../../controller/GeneralApi/index.js");
const router = express.Router();


router.get("/getassignedsubjects", PastPaperSupervisorController.getUserAssignedSubjects);
router.get("/getsubjectnames", PastPaperSupervisorController.getSubjectNames);
router.get("/getallboards", BoardManagementController.getAllBoards);
router.get("/getallsubboards", BoardManagementController.GetSubBoards);
router.get("/getsubjectdetailsbyids", SubjectManagementController.getSubjectDetailsByBoardSubBoardGrade);
router.get("/getsubjectbysubjectnameid", SubjectManagementController.getSubjectBySubjectNameId);

router.get("/getallshmsheets", paginatedSheetManagementSheets(), (req, res) => {
    res.json(res.paginatedResults);
});

router.patch("/updateinprogressstatus", PricerSheetManagementController.updateInProgressTaskStatus)
router.patch("/updatecompletestatus", PricerSheetManagementController.updateCompletedTaskStatus)

router.get("/gettopicsubtopicvocabmappingsforquestion", PricerSheetManagementController.getTopicSubTopicVocabMappingsForQuestion);
router.patch("/addprice", PricerSheetManagementController.addPriceForQuestion);
router.patch("/removeprice", PricerSheetManagementController.removePriceForQuestion);
router.get("/getquestions", QuestionManagementController.getQuestions);

router.get("/sheeterrorsbyreviewer", PricerSheetManagementController.getErrorsForQuestion);
router.patch("/assigntosupervisor", PricerSheetManagementController.AssignSheetToSupervisor)
router.patch("/addsheeterror", PricerSheetManagementController.reportSheetError);
router.get("/getallSheetbySubjectid", GeneralApi.getAllSheetBySubjectIdandUserId);
router.get("/getallPastPaperbySubjectid", GeneralApi.getAllPastPaperSheetBySubjectIdandUserId);
router.get("/getallPaperNumberbySubjectid", GeneralApi.getAllPaperNoSheetBySubjectIdandUserId);
router.get("/getallBookTasksbySubjectid", GeneralApi.getAllBookSheetBySubjectIdandUserId);
router.get("/getallTopicTasksbySubjectid", GeneralApi.getAllTopicSheetBySubjectIdandUserId);


module.exports = router;