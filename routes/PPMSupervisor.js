const express = require("express");
const PastPaperSupervisorController = require("../controller/PPMSupervisor/PPMSupervisor.js");
const { Sheet } = require("../models/Sheet.js");
const paginatedSheetResults = require("../middlewares/paginatedSheet.js");

const router = express.Router();

router.post("/createsheet", PastPaperSupervisorController.CreateSheet);

router.get(
  "/getuserassignedsubjects",
  PastPaperSupervisorController.getUserAssignedSubjects
);

router.get("/getsubjectnames", PastPaperSupervisorController.getSubjectNames);

router.get("/getallboards", PastPaperSupervisorController.getallboards);

router.get("/getallroles", PastPaperSupervisorController.getallroles);

router.get("/getsheetlogs", PastPaperSupervisorController.getSheetLogs);

router.get("/getusers", PastPaperSupervisorController.getAllUserByRole);

router.get("/getuser", PastPaperSupervisorController.getUsers);

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
router.get("/getalllevels", PastPaperSupervisorController.getalllevels);

router.get("/getallsheets", paginatedSheetResults(Sheet), (req, res) => {
  res.json(res.paginatedResults);
});

router.get(
  "/getsheetsubjects",
  PastPaperSupervisorController.getallsheetsubjects
);

router.get("/getsubjectnames", PastPaperSupervisorController.getSubjectNames);

router.get("/getallsubboards", PastPaperSupervisorController.getAllSubBoards);
router.get("/getallboards", PastPaperSupervisorController.getAllboards);

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
