const express = require("express");
const router = express.Router();
const PastPaperReviewerController = require("../controller/PastPaperReviewer/PastPaperReviewer");
const upload = require("../config/multer.js");
const getPaginatedReviewersheets = require("../middlewares/getPaginatedReviewerSheets");

// api/ppmReviewer/getsheets
router.get("/getsheets", getPaginatedReviewersheets(), (req, res) => {
  res.json(res.paginatedResults);
});

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

module.exports = router;
