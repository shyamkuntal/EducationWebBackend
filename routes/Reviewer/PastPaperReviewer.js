const express = require("express");
const router = express.Router();
const PastPaperReviewerController = require("../../controller/Reviewer/PastPaperReviewer/PastPaperReviewer");
const PastPaperSupervisorController = require("../../controller/Supervisor/PastPaperManagement/PPMSupervisor");
const BoardManagementController = require("../../controller/SuperAdmin/BoardManagement/BoardM");

const upload = require("../../config/multer.js");
const paginatedSheetResults = require("../../middlewares/paginatedSheet.js");

// api/ppmreviewer/getsheets
router.get("/getallsheets", paginatedSheetResults(), (req, res) => {
  res.json(res.paginatedResults);
});

// api/ppmreviewer/getsubjectnames
router.get("/getsubjectnames", PastPaperSupervisorController.getSubjectNames);

// api/ppmreviewer/getallboards
router.get("/getallboards", BoardManagementController.getAllBoards);

// api/ppmreviewer/getallsubboards
router.get("/getallsubboards", BoardManagementController.GetSubBoards);

// api/ppmreviewer/getrecheckcomments
router.get("/getrecheckcomments", PastPaperReviewerController.getRecheckErrors);

// api/ppmreviewer/updateinprogresssheetstatus
router.patch(
  "/updateinprogresssheetstatus",
  PastPaperReviewerController.UpdateInprogressSheetStatus
);

// api/ppmreviewer/updatecompletessheetstatus
router.patch("/updatecompletessheetstatus", PastPaperReviewerController.UpdateCompleteSheetStatus);

// api/ppmreviewer/assignsheettosupervisor
router.patch("/submitsheettosupervisor", PastPaperReviewerController.AssignSheetToSupervisor);

// api/ppmreviewer/reportsheeterror
router.patch(
  "/reportsheeterror",
  upload.single("errorReportFile"),
  PastPaperReviewerController.ReportError
);

// api/ppmreviewer/getpastpaper
router.get("/getpastpaper", PastPaperSupervisorController.getPastPaper);

// api/ppmreviewer/reportrecheckerror
router.post("/reportrecheckerror", PastPaperReviewerController.AddRecheckComment);

// api/ppmreviewer/getuserassignedsubjects
router.get("/getuserassignedsubjects", PastPaperSupervisorController.getUserAssignedSubjects);

module.exports = router;
