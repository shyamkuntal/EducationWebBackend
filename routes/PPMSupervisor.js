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
} from "../controller/PPMSupervisor/PPMSupervisor.js";
import { Sheet } from "../models/Sheet.js";
import { paginatedSheetResults } from "../middlewares/paginatedSheet.js";
// import {
//   AddSheetAssignmentToPastPaper,
//   CreateSheet,
//   ToggleArchiveSheet,
//   TogglePublishSheet,
//   getallboards,
//   getallgrades,
//   getalllevels,
//   getallsubboards,
//   getallsubjects,
//   getsheetsubjects,
//   getsinglesheet,
// } from "../controllers/PPMSupervisor/PPMSupervisor.js";
// import { paginatedSheetResults } from "../middleware/SheetFilters.js";
// import SheetData from "../models/Sheet.js";

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

// router.post("/:sheetid/createassignmenttopp", AddSheetAssignmentToPastPaper);
export default router;
