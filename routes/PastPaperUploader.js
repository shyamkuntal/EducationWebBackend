const express = require("express");
const upload = require("../config/multer.js");
const {
  createPastPaper,
  getAssignedSheets,
  SubmitToSupervisor,
  Markitascomplete,
  getallassignedsheetsubjects,
  EditPastPaper,
} = require("../controller/PastPaperUploader/PastPaper.js");

const router = express.Router();

router.get("/:userId/getassignedsheets", getAssignedSheets);
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
module.exports = router;
