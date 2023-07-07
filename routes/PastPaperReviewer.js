const express = require("express");
const router = express.Router();
const PastPaperReviewerController = require("../controller/PastPaperReviewer/PastPaperReviewer");
const upload = require("../config/multer.js");
// const getPaginatedReviewersheets = require("../middlewares/paginatedReviewerSheets");
const paginatedSheetResults = require("../middlewares/paginatedSheet.js");
const { Sheet } = require("../models/Sheet.js");
const PastPaperSupervisorController = require("../controller/PPMSupervisor/PPMSupervisor");


// api/ppmReviewer/getsheets
// router.get("/getsheets", getPaginatedReviewersheets(), (req, res) => {
//   res.json(res.paginatedResults);
// });
// api/ppmReviewer/getsheets
router.get("/getallsheets", paginatedSheetResults(Sheet), (req, res) => {
  res.json(res.paginatedResults);
})

// api/ppmReviewer/getsubjectnames
router.get("/getsubjectnames", PastPaperReviewerController.getsubjectName, (req, res) => {
  res.json(res);
});

router.get("/getallboards", PastPaperReviewerController.getAllboards);

router.get(
  "/getallsubboards",
  PastPaperReviewerController.getAllSubBoards
);

// api/ppmReviewer/getrecheckcomments
router.get("/getrecheckcomments", PastPaperReviewerController.getRecheckErrors);

// api/ppmReviewer/updateinprogresssheetstatus
router.patch(
  "/updateinprogresssheetstatus",
  PastPaperReviewerController.UpdateInprogressSheetStatus
);

// api/ppmReviewer/updatecompletessheetstatus
router.patch(
  "/updatecompletessheetstatus",
  PastPaperReviewerController.UpdateCompleteSheetStatus
);

// api/ppmReviewer/assignsheettosupervisor
router.patch(
  "/submitsheettosupervisor",
  PastPaperReviewerController.AssignSheetToSupervisor
);

// api/ppmReviewer/reportsheeterror
router.patch( 
  "/reportsheeterror",
  upload.single("errorReportFile"),
  PastPaperReviewerController.ReportError
);

router.get("/getpastpaper", PastPaperSupervisorController.getPastPaper);
// api/ppmReviewer/reportsheeterror
router.post("/reportsheeterror", PastPaperReviewerController.AddRecheckComment);

router.get("/getuserassignedsubjects", PastPaperReviewerController.getUserAssignedSubjects);

module.exports = router;
