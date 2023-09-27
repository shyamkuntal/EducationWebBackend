const express = require("express");
const PastPaperSupervisorController = require("../../controller/Supervisor/PPMSupervisor");
const BoardManagementController = require("../../controller/SuperAdmin/BoardM.js");
const SubjectManagementController = require("../../controller/Supervisor/ManageSubject.js");
const paginatedSheetManagementSheets = require("../../middlewares/paginatedSheetManagementSheets");
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


module.exports = router;