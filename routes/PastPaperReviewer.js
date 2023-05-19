const express = require("express");
const router = express.Router();
const PastPaperReviewerController = require("../controller/PastPaperReviewer/PastPaperReviewer");
const upload = require("../config/multer.js");

// api/ppmReviewer/getsheets
router.patch(
  "/getsheets",
  PastPaperReviewerController.UpdateInprogressSheetStatus
);

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
router.post(
  "/reportsheeterror",
  upload.single("errorReportFile"),
  PastPaperReviewerController.ReportError
);

module.exports = router;
