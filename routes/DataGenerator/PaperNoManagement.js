const express = require("express");
const PastPaperSupervisorController = require("../../controller/Supervisor/PPMSupervisor.js");
const BoardManagementController = require("../../controller/SuperAdmin/BoardM.js");
const PaperNoDGController = require("../../controller/DataGenerator/PaperNoManagement");
const paginatedPaperNumberSheet = require("../../middlewares/paginatedPaperNumber");
const { PaperNumberSheet } = require("../../middlewares/paginatedPaperNumber");
const SubjectManagementController = require("../../controller/Supervisor/ManageSubject.js");
const PaperNumberReviewerController = require("../../controller/Reviewer/PaperNumberReviewer.js");

const router = express.Router();

router.get("/getallPaperNumberSheets", paginatedPaperNumberSheet(PaperNumberSheet), (req, res) => {
  res.json(res.paginatedResults);
});
router.get("/getpapernumberbypnsheetid", PaperNoDGController.getPaperNumberByPaperNumberSheet);
router.post("/createpapernumber", PaperNoDGController.createPaperNumber);
router.patch("/updatepapernumber", PaperNoDGController.EditPaperNumber);
router.post("/deletepapernumber", PaperNoDGController.deletePaperNumber);
router.get("/getallPaperNumber", PaperNoDGController.getAllPaperNumber);
router.get("/getassignedsubjects", PastPaperSupervisorController.getUserAssignedSubjects);
router.get("/getsubjectnames", PastPaperSupervisorController.getSubjectNames);
router.get("/getallboards", BoardManagementController.getAllBoards);
router.get("/getallsubboards", BoardManagementController.GetSubBoards);
router.get("/getsubjectdetailsbyids", SubjectManagementController.getSubjectDetailsByBoardSubBoardGrade);
router.get("/getsubjectbysubjectnameid", SubjectManagementController.getSubjectBySubjectNameId);
router.patch("/submittosupervisor", PaperNoDGController.SubmitToSupervisor);
router.patch("/markitasinprogress", PaperNoDGController.MarkitasInProgress);
router.patch("/markitascomplete", PaperNoDGController.Markitascomplete);
router.get("/getallpapernumber", PaperNoDGController.getAllPaperNumber);
// api/pnreviewer/getrecheckcomment
router.get("/getrecheckcomment", PaperNoDGController.getRecheckComment);
// api/pnreviewer/geterrorreportfile
router.get("/geterrorreportfile", PaperNumberReviewerController.getErrorReportFile);

router.get("/getcountscarddata", PaperNoDGController.getCountsCardData);

module.exports = router;
