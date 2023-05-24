const express = require("express");
const upload = require("../config/multer.js");
const {
  createPastPaper,
  getAssignedSheets,
  SubmitToSupervisor,
  Markitascomplete,
  getallassignedsheetsubjects,
  EditPastPaper,
  getdatafordashboard,
} = require("../controller/PastPaperUploader/PastPaper.js");
const paginatedSheetResults = require("../middlewares/paginatedSheet.js");
const { Sheet } = require("../models/Sheet.js");

const router = express.Router();

router.get(
  "/:userId/getassignedsheets",
  paginatedSheetResults(Sheet),
  getAssignedSheets
);
router.get("/:userId/getassignedsubjects", getallassignedsheetsubjects);
router.post(
  "/createpastpaper",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 2 },
  ]),
  createPastPaper
);
// router.patch("/:sheetId/changestatus", ChangeStatus);
router.patch("/:sheetId/submittosupervisor", SubmitToSupervisor);
router.patch("/:sheetId/markitascomplete", Markitascomplete);
router.put("/:ppId/editpastpaper", EditPastPaper);
router.get("/:userId/getdatafordash", getdatafordashboard);

module.exports = router;
