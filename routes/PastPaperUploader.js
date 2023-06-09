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

const router = express.Router();

router.get(
  "/:userId/getassignedsheets",
  paginatedSheetResults(Sheet),
  getAssignedSheets
);

router.get(
  "/:sheetId/getsinglesheet",
  paginatedSheetResults(Sheet),
  getsinglesheet
);


router.get("/:userId/getassignedsubjects", getallassignedsheetsubjects);


router.post(
  "/createpastpaper",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "questionPdf", maxCount: 1 },
    { name: "answerPdf", maxCount: 1 },
  ]),
  createPastPaper
);
// router.patch("/:sheetId/changestatus", ChangeStatus);
router.patch("/:sheetId/submittosupervisor", SubmitToSupervisor);

router.patch("/markitasinprogress", MarkitasInProgress);

router.patch("/markitascomplete", Markitascomplete);

router.put("/:ppId/editpastpaper", EditPastPaper);

router.get("/:userId/getdatafordashboard",
  paginatedSheetResults(Sheet),
  getdatafordashboard);

module.exports = router;
