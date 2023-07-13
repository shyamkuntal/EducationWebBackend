const express = require("express");
const PaperNumberSheetController = require("../controller/PaperNumberManagement/PaperNumber");
const { PaperNumberSheet } = require("../models/PaperNumber");
const paginatedPaperNumberSheet = require("../middlewares/paginatedPaperNumber");

const router = express.Router();

router.post("/createPaperNumberSheet", PaperNumberSheetController.CreatePaperNumberSheet);

router.put("/updatepapernumbersheet", PaperNumberSheetController.UpdatePaperNumberSheet);

router.get("/getallPaperNumberSheets", paginatedPaperNumberSheet(PaperNumberSheet), (req, res) => {
  res.json(res.paginatedResults);
});

router.post("/createPaperNumber", PaperNumberSheetController.createPaperNumber);

router.get("/getallPaperNumber", PaperNumberSheetController.getAllPaperNumber);

router.get(
  "/getpapernumberbypnsheetid",
  PaperNumberSheetController.getPaperNumberByPaperNumberSheet
);

router.put("/updatepapernumber", PaperNumberSheetController.EditPaperNumber);

router.patch("/assignsheettodatagenerator", PaperNumberSheetController.AssignSheetToDataGenerator);

router.patch("/assignsheettoreviewer", PaperNumberSheetController.AssignSheetToReviewer);

router.patch("/togglepublish", PaperNumberSheetController.TogglePublishSheet);



module.exports = router;
