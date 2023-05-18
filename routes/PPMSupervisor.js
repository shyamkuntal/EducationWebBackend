import express from "express";
import {
  CreateSheet,
  ToggleArchiveSheet,
  TogglePublishSheet,
  getallboards,
  getallgrades,
  getalllevels,
  getallsheetsubjects,
  getallsubboards,
  getallsubjects,
  getsinglesheet,
  AssignSheetToPastPaper,
  AssignSheetToReviewer,
} from "../controller/PPMSupervisor/PPMSupervisor.js";
import { Sheet } from "../models/Sheet.js";
import { paginatedSheetResults } from "../middlewares/paginatedSheet.js";

const router = express.Router();

router.post("/createsheet", CreateSheet);
router.get("/getallboards", getallboards);
router.get("/:boardId/getallsubboards", getallsubboards);
router.get("/:boardId/:SubBoardId/getallgrades", getallgrades);
router.get("/:boardId/:SubBoardId/:grade/getallsubjects", getallsubjects);
router.get("/:subjectid/getalllevels", getalllevels);
router.get("/getallsheets", paginatedSheetResults(Sheet), (req, res) => {
  res.json(res.paginatedResults);
});
router.get("/getsheetsubjects", getallsheetsubjects);
router.get("/:sheetid/getsheet/", getsinglesheet);
router.patch("/:sheetid/togglepublishsheet", TogglePublishSheet);
router.patch("/:sheetid/togglearchivesheet", ToggleArchiveSheet);

router.patch("/assignsheettopastpaper", AssignSheetToPastPaper);
router.patch("/assignsheettoreviewer", AssignSheetToReviewer);
export default router;
