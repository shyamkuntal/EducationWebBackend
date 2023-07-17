const express = require("express");
const upload = require("../config/multer.js");
const PastPaperSupervisorController = require("../controller/PastPaperManagement/PPMSupervisor.js");
const BoardManagementController = require("../controller/BoardManagement/BoardM.js");
const DataGeneratorController = require("../controller/DataGenerator/DataGeneratorManagement.js");
const paginatedPaperNumberSheet = require("../middlewares/paginatedPaperNumber.js");
const { PaperNumberSheet } = require("../models/PaperNumber.js");
const SubjectManagementController = require("../controller/SubjectManagement/ManageSubject.js");

const router = express.Router();

router.get("/getallPaperNumberSheets", paginatedPaperNumberSheet(PaperNumberSheet), (req, res) => {
    res.json(res.paginatedResults);
});

router.get(
    "/getpapernumberbypnsheetid",
    DataGeneratorController.getPaperNumberByPaperNumberSheet
);

router.post("/createpapernumber", DataGeneratorController.createPaperNumber);

router.put("/updatepapernumber", DataGeneratorController.EditPaperNumber);

router.delete("/deletepapernumber", DataGeneratorController.deletePaperNumber);

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

router.get("/getsubjectnames", PastPaperSupervisorController.getSubjectNames);

router.patch("/submittosupervisor", DataGeneratorController.SubmitToSupervisor);

router.patch("/markitasinprogress", DataGeneratorController.MarkitasInProgress);

router.patch("/markitascomplete", DataGeneratorController.Markitascomplete);

router.get("/getallpapernumber", DataGeneratorController.getAllPaperNumber);

module.exports = router; 