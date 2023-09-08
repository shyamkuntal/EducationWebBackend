const express = require("express");
const router = express.Router();
const SheetManagementController = require("../../controller/Supervisor/SheetManagement");

router.post("/createsheet", SheetManagementController.createSheet);

module.exports = router;
