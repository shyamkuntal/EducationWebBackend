const express = require("express");
const router = express.Router();
const DashBoardController = require("../../controller/Supervisor/DashBoard");

router.get("/getboarddata", DashBoardController.getAllBoardSubBoard);
router.get("/gettotal", DashBoardController.getTotal);
module.exports = router;