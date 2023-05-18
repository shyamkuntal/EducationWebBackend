import express from "express";
import { createPastPaper } from "../controller/PastPaperUploader/PastPaper.js";
import upload from "../config/multer.js";

const router = express.Router();

//router.get("/:userId/getassignedsheets", getAssignedSheets);
router.post(
  "/createpastpaper",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 2 },
  ]),
  createPastPaper
);
// router.patch("/:sheetId/changestatus", ChangeStatus);
// router.patch("/:sheetId/submittosupervisor", SubmitToSuperVisor);
export default router;
