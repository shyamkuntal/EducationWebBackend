const express = require("express");
const router = express.Router();
const PaperNumberReviewerController = require("../controller/PaperNumberReviewer/PaperNumberReviewer");
const paginatedPaperNumberSheet = require("../middlewares/paginatedPaperNumber");
const BoardManagementController = require("../controller/BoardManagement/BoardM");

// api/pnreviewer/getsheets
router.get("/getallsheets", paginatedPaperNumberSheet(), (req, res) => {
  res.json(res.paginatedResults);
});

// api/pnreviewer/updateinprogresssheetstatus
router.patch(
  "/updateinprogresssheetstatus",
  PaperNumberReviewerController.UpdateInprogressSheetStatus
);

// api/pnreviewer/getallboards
router.get("/getallboards", BoardManagementController.getAllBoards);

// api/pnreviewer/getsubboardsbyboard
router.get("/getsubboardsbyboard", BoardManagementController.GetSubBoards);

module.exports = router;
