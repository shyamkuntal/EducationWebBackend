const express = require("express");
const BoardManagementController = require("../controller/BoardManagement/BoardM.js");
const paginatedResults = require("../middlewares/paginatedResults.js");
const { Board } = require("../models/Board.js");
//import { CreateBoard } from "../controller/BoardManagement/BoardM.js";
const router = express.Router();

router.get("/getallboards", paginatedResults(Board), (req, res) => {
  console.log(paginatedResults);
  res.json(res.paginatedResults);
});

router.get("/:boardId/getsubboards", BoardManagementController.GetSubBoards);
router.get(
  "/getboardsandsubboards",
  BoardManagementController.GetBoardAndSubBords
);
router.post("/createboard", BoardManagementController.CreateBoard);
router.post("/createsubboard", BoardManagementController.createSubBoard);
router.put("/editboard", BoardManagementController.UpdateBoard);
router.patch(
  "/togglepublishboard",
  BoardManagementController.TogglePublishBoard
);
router.patch(
  "/togglearchiveboard",
  BoardManagementController.ToggleArchiveBoard
);
router.patch(
  "/togglearchivesubboard",
  BoardManagementController.ToggleArchiveSubBoards
);

module.exports = router;
