const express = require("express");
const router = express.Router();
const QuestionManagementController = require("../../controller/Uploader2/QuestionManagement");

router.post("/createquestion", QuestionManagementController.createQuestion);

module.exports = router;
