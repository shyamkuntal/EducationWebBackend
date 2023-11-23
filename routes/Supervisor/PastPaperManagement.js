const express = require("express");
const PastPaperSupervisorController = require("../../controller/Supervisor/PPMSupervisor");
const paginatedSheetResults = require("../../middlewares/paginatedSheet.js");

const router = express.Router();

router.post("/createvariant", PastPaperSupervisorController.createVariant);

router.get("/getallvariants", PastPaperSupervisorController.getAllVariants);

router.patch("/editvariant", PastPaperSupervisorController.editVariant);

router.patch("/updatesheet", PastPaperSupervisorController.UpdateSheet);

router.delete("/deletevariant", PastPaperSupervisorController.deleteVariant);

router.post("/createsheet", PastPaperSupervisorController.CreateSheet);

router.get("/getuserassignedsubjects", PastPaperSupervisorController.getUserAssignedSubjects);

router.get("/getsubjectnames", PastPaperSupervisorController.getSubjectNames);

//router.get("/getallboards", PastPaperSupervisorController.getallboards);

router.get("/getallroles", PastPaperSupervisorController.getallroles);

router.get("/getsheetlogs", PastPaperSupervisorController.getSheetLogs);

router.get("/getusers", PastPaperSupervisorController.getAllUserByRole);

router.get("/getuser", PastPaperSupervisorController.getUsers);

router.get("/:boardId/getallsubboards", PastPaperSupervisorController.getallsubboards);
router.get("/:boardId/:SubBoardId/getallgrades", PastPaperSupervisorController.getallgrades);
router.get(
  "/:boardId/:SubBoardId/:grade/getallsubjects",
  PastPaperSupervisorController.getallsubjects
);
router.get("/getalllevels", PastPaperSupervisorController.getalllevels);

router.get("/getallsheets", paginatedSheetResults(), (req, res) => {
  res.json(res.paginatedResults);
});

router.get("/getsheetsubjects", PastPaperSupervisorController.getallsheetsubjects);

router.get("/getallsubboards", PastPaperSupervisorController.getAllSubBoards);
router.get("/getallboards", PastPaperSupervisorController.getAllboards);

router.get("/:sheetid/getsheet/", PastPaperSupervisorController.getsinglesheet);

router.patch("/:sheetid/togglepublishsheet", PastPaperSupervisorController.TogglePublishSheet);

router.patch("/assignsheettoreviewer", PastPaperSupervisorController.AssignSheetToReviewer);
router.patch("/assignsheettopastpaper", PastPaperSupervisorController.AssignSheetToPastPaper);

router.get("/getpastpaper", PastPaperSupervisorController.getPastPaper);

router.get(
  "/getpapernumberbyboardsubBoardgradesubject",
  PastPaperSupervisorController.getPaperNumberbyBoardSubBoardGradeSubject
  );
  
router.patch("/togglearchivesheet", PastPaperSupervisorController.ToggleArchiveSheet);

router.get("/getCountCardData", PastPaperSupervisorController.getCountsCardData);


module.exports = router;
