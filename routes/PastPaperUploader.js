const express = require("express");
const upload = require("../config/multer.js");
const {
  createPastPaper,
  getAssignedSheets,
  getsinglesheet,
  SubmitToSupervisor,
  Markitascomplete,
  MarkitasInProgress,
  getallassignedsheetsubjects,
  EditPastPaper,
  getdatafordashboard,
  getSingleAssignedSheet,
} = require("../controller/PastPaperUploader/PastPaper.js");
const paginatedSheetResults = require("../middlewares/paginatedSheet.js");
const { Sheet } = require("../models/Sheet.js");
const PastPaperUploaderController = require("../controller/PastPaperUploader/PastPaper.js");

const router = express.Router();

router.get("/getallsheets", paginatedSheetResults(Sheet), (req, res) => {
  res.json(res.paginatedResults);
})

router.get(
  "/:sheetId/getsinglesheet",
  paginatedSheetResults(Sheet),
  getsinglesheet
);


router.get("/:userId/getassignedsubjects", getallassignedsheetsubjects);

// api/ppmReviewer/getrecheckcomments
router.get("/getrecheckcomments", PastPaperUploaderController.getRecheckErrors);


router.get("/getuserassignedsubjects", PastPaperUploaderController.getUserAssignedSubjects);

router.post(
  "/createpastpaper",
  upload.fields([
    { name: "questionPdf", maxCount: 1 },
    { name: "answerPdf", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  createPastPaper
);
// router.patch("/:sheetId/changestatus", ChangeStatus);
router.patch("/submittosupervisor", SubmitToSupervisor);

router.patch("/markitasinprogress", MarkitasInProgress);

router.patch("/markitascomplete", Markitascomplete);

router.put("/:ppId/editpastpaper", EditPastPaper);

// api/ppmReviewer/getsubjectnames
router.get("/getsubjectnames", PastPaperUploaderController.getsubjectName);

router.get("/:userId/getdatafordashboard",
  paginatedSheetResults(Sheet),
  getdatafordashboard);

  router.get("/getallboards", PastPaperUploaderController.getAllboards);

  router.get(
    "/getallsubboards",
    PastPaperUploaderController.getAllSubBoards
  );

module.exports = router;
