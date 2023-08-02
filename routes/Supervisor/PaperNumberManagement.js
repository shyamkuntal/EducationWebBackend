const express = require("express");
const PaperNumberSheetController = require("../../controller/Supervisor/PaperNumberManagement/PaperNumber");
const { PaperNumberSheet } = require("../../models/PaperNumberSheet");
const paginatedPaperNumberSheet = require("../../middlewares/paginatedPaperNumber");
const DataGeneratorController = require("../../controller/DataGenerator/DataGeneratorManagement");
const PaperNumberReviewerController = require("../../controller/Reviewer/PaperNumberReviewer/PaperNumberReviewer");
const PastPaperSupervisorController = require("../../controller/Supervisor/PastPaperManagement/PPMSupervisor");

const router = express.Router();

router.post("/createPaperNumberSheet", PaperNumberSheetController.CreatePaperNumberSheet);

router.put("/updatepapernumbersheet", PaperNumberSheetController.UpdatePaperNumberSheet);

router.get("/getallPaperNumberSheets", paginatedPaperNumberSheet(PaperNumberSheet), (req, res) => {
  res.json(res.paginatedResults);
});

router.get("/getallPaperNumber", DataGeneratorController.getAllPaperNumber);

router.patch("/assignsheettodatagenerator", PaperNumberSheetController.AssignSheetToDataGenerator);

router.patch("/assignsheettoreviewer", PaperNumberSheetController.AssignSheetToReviewer);

router.patch("/togglepublish", PaperNumberSheetController.TogglePublishSheet);

router.get("/getsheetlogs", PaperNumberSheetController.getSheetLogs);

router.get("/getpapernumberbypnsheetid", DataGeneratorController.getPaperNumberByPaperNumberSheet);

// api/pnreviewer/geterrorreportfile
router.get("/geterrorreportfile", PaperNumberReviewerController.getErrorReportFile);

router.get("/getsubjectnames", PastPaperSupervisorController.getSubjectNames);

router.get("/getdistinctpapernumbers", PaperNumberSheetController.getDistinctPaperNumbers);

module.exports = router;
