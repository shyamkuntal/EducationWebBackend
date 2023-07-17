const express = require("express");
const upload = require("../config/multer.js");
const {
  createPastPaper,
  getAssignedSheets,
  getsinglesheet,
  SubmitToSupervisor,
  Markitascomplete,
  MarkitasInProgress,
  EditPastPaper,
  getdatafordashboard,
  getSingleAssignedSheet,
} = require("../controller/PastPaperUploader/PastPaper.js");
const paginatedSheetResults = require("../middlewares/paginatedSheet.js");
const PastPaperUploaderController = require("../controller/PastPaperUploader/PastPaper.js");
const PastPaperSupervisorController = require("../controller/PastPaperManagement/PPMSupervisor.js");
const BoardManagementController = require("../controller/BoardManagement/BoardM.js");

const router = express.Router();

router.get("/getallsheets", paginatedSheetResults(), (req, res) => {
  res.json(res.paginatedResults);
});

router.get("/:sheetId/getsinglesheet", paginatedSheetResults(), getsinglesheet);

router.get("/getassignedsubjects", PastPaperSupervisorController.getUserAssignedSubjects);

router.get("/getrecheckcomments", PastPaperUploaderController.getRecheckErrors);

router.post(
  "/createpastpaper",
  upload.fields([
    { name: "questionPdf", maxCount: 1 },
    { name: "answerPdf", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  PastPaperUploaderController.createPastPaper
);
// router.patch("/:sheetId/changestatus", ChangeStatus);
router.patch("/submittosupervisor", SubmitToSupervisor);

router.patch("/markitasinprogress", MarkitasInProgress);

router.patch("/markitascomplete", Markitascomplete);

router.put(
  "/editpastpaper",
  upload.fields([
    { name: "newQuestionPaper", maxCount: 1 },
    { name: "newAnswerPaper", maxCount: 1 },
    { name: "newImageBanner", maxCount: 1 },
  ]),
  EditPastPaper
);

router.get("/getpastpaper", PastPaperSupervisorController.getPastPaper);

router.get("/getsubjectnames", PastPaperSupervisorController.getSubjectNames);

router.get("/:userId/getdatafordashboard", paginatedSheetResults(), getdatafordashboard);

router.get("/getallboards", BoardManagementController.getAllBoards);

router.get("/getallsubboards", BoardManagementController.GetSubBoards);

router.get("/geterrorreportfiles", PastPaperUploaderController.getErrorReportFiles);

module.exports = router;
