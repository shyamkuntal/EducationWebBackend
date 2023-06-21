const express = require("express");
const router = express.Router();
const PastPaperReviewerController = require("../controller/PastPaperReviewer/PastPaperReviewer");
const upload = require("../config/multer.js");
const getPaginatedReviewersheets = require("../middlewares/paginatedReviewerSheets");


// api/ppmReviewer/getsheets
router.get("/getsheets", getPaginatedReviewersheets(), (req, res) => {
  res.json(res.paginatedResults);
});

// api/ppmReviewer/getsubjectnames
router.get("/getsubjectnames", PastPaperReviewerController.getsubjectName, (req, res) => {
  res.json(res);
});

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

// api/ppmReviewer/reportsheeterror
router.post("/reportsheeterror", PastPaperReviewerController.AddRecheckComment);

router.get("/getuserassignedsubjects", PastPaperReviewerController.getUserAssignedSubjects);

module.exports = router;
