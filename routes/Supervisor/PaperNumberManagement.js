const express = require("express");
const PaperNumberSheetController = require("../../controller/Supervisor/PaperNumber");
const { PaperNumberSheet } = require("../../models/PaperNumberSheet");
const paginatedPaperNumberSheet = require("../../middlewares/paginatedPaperNumber");
const DataGeneratorController = require("../../controller/DataGenerator/PaperNoManagement");
const PaperNumberReviewerController = require("../../controller/Reviewer/PaperNumberReviewer");
const PastPaperSupervisorController = require("../../controller/Supervisor/PPMSupervisor");

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

router.patch("/archiveallpaperno", PaperNumberSheetController.ArchiveAllPaperNumber);
router.patch("/archivepapernumber", PaperNumberSheetController.ArchiveSinglePaperNo);

router.get("/getCountCardData", PaperNumberSheetController.getCountsCardData);

module.exports = router;
