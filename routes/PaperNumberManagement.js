const express = require("express");
const PaperNumberSheetController = require("../controller/PaperNumberManagement/PaperNumber");
const { PaperNumberSheet } = require("../models/PaperNumber");
const paginatedPaperNumberSheet = require("../middlewares/paginatedPaperNumber");
const DataGeneratorController = require("../controller/DataGenerator/DataGeneratorManagement");

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



module.exports = router;
