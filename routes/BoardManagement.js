const express = require("express");
const BoardManagementController = require("../controller/BoardManagement/BoardM.js");
const paginatedResults = require("../middlewares/paginatedResults.js");
const { Board } = require("../models/Board.js");
//import { CreateBoard } from "../controller/BoardManagement/BoardM.js";
const router = express.Router();

router.get("/getallboards", paginatedResults(Board), (req, res) => {
  res.json(res.paginatedResults);
});
router.post("/createboard", BoardManagementController.CreateBoard);
router.put("/:id/editboard", BoardManagementController.UpdateBoard);
router.patch(
  "/:id/togglepublishboard",
  BoardManagementController.TogglePublishBoard
);
router.patch(
  "/:id/togglearchiveboard",
  BoardManagementController.ToggleArchiveBoard
);
router.patch(
  "/:id/togglearchive/subboard",
  BoardManagementController.ToggleArchiveSubBoards
);

module.exports = router;
