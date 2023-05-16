import express from "express";
import {
  CreateBoard,
  ToggleArchiveBoard,
  ToggleArchiveSubBoards,
  TogglePublishBoard,
  UpdateBoard,
} from "../controller/BoardManagement/BoardM.js";
import { paginatedResults } from "../middlewares/paginatedResults.js";
import { Board } from "../models/Board.js";
//import { CreateBoard } from "../controller/BoardManagement/BoardM.js";

const router = express.Router();
router.get("/getallboards", paginatedResults(Board), (req, res) => {
  res.json(res.paginatedResults);
});
router.post("/createboard", CreateBoard);
router.put("/:id/editboard", UpdateBoard);
router.patch("/:id/togglepublishboard", TogglePublishBoard);
router.patch("/:id/togglearchiveboard", ToggleArchiveBoard);
router.patch("/:id/togglearchive/subboard", ToggleArchiveSubBoards);

export default router;
