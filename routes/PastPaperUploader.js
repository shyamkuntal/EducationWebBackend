import express from "express";
import { getAssignedSheets } from "../controller/PastPaperUploader/PastPaper";

const router = express.Router();

router.get("/:userId/getassignedsheets", getAssignedSheets);
// router.patch("/:sheetId/changestatus", ChangeStatus);
// router.patch("/:sheetId/submittosupervisor", SubmitToSuperVisor);
export default router;
