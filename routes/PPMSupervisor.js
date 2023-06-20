const express = require("express");
const PastPaperSupervisorController = require("../controller/PPMSupervisor/PPMSupervisor.js");
const { Sheet } = require("../models/Sheet.js");
const paginatedSheetResults = require("../middlewares/paginatedSheetForSupervisor.js");

const router = express.Router();

router.post("/createsheet", PastPaperSupervisorController.CreateSheet);
router.get("/getallboards", PastPaperSupervisorController.getallboards);

router.get(
  "/:boardId/getallsubboards",
  PastPaperSupervisorController.getallsubboards
);
router.get(
  "/:boardId/:SubBoardId/getallgrades",
  PastPaperSupervisorController.getallgrades
);
router.get(
  "/:boardId/:SubBoardId/:grade/getallsubjects",
  PastPaperSupervisorController.getallsubjects
);
router.get(
  "/:subjectid/getalllevels",
  PastPaperSupervisorController.getalllevels
);
router.get("/getallsheets", 
  paginatedSheetResults(Sheet), (req, res) => {
  res.json(res.paginatedResults);
});
router.get(
  "/getsheetsubjects",
  PastPaperSupervisorController.getallsheetsubjects
);

router.get("/:sheetid/getsheet/", PastPaperSupervisorController.getsinglesheet);

router.patch(
  "/:sheetid/togglepublishsheet",
  PastPaperSupervisorController.TogglePublishSheet
);

router.patch(
  "/:sheetid/togglearchivesheet",
  PastPaperSupervisorController.ToggleArchiveSheet
);
router.patch(
  "/assignsheettopastpaper",
  PastPaperSupervisorController.AssignSheetToPastPaper
);
router.patch(
  "/assignsheettoreviewer",
  PastPaperSupervisorController.AssignSheetToReviewer
);

module.exports = router;
