const express = require("express");
const router = express.Router();
const SheetManagementController = require("../../controller/Supervisor/SheetManagement");
const { findBookByBookId } = require("../../services/bookTaskService");
const BookManagementController = require("../../controller/Supervisor/Book");
const paginatedSheetManagementSheets = require("../../middlewares/paginatedSheetManagementSheets");

router.post("/createsheet", SheetManagementController.createSheet);

router.get("/getallchapterbybookid", BookManagementController.getAllChapterByBookId);

router.get("/getallshmsheets", paginatedSheetManagementSheets(), (req, res) => {
  res.json(res.paginatedResults);
});

router.patch("/assignsheettouploader2", SheetManagementController.assignSheetToUploader);

router.patch("/assignsheettoreviewer", SheetManagementController.assignSheetToReviewer);

router.patch("/assignsheettoteacher", SheetManagementController.assignSheetToTeacher);

router.get("/getsheetlogs", SheetManagementController.getSheetLogs);

router.patch("/archivesheet", SheetManagementController.ArchiveSheet);

module.exports = router;
