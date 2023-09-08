const express = require("express");
const router = express.Router();
const QuestionManagementController = require("../../controller/Uploader2/QuestionManagement");
const QuestionManagementSarveshController = require("../../controller/Uploader2/QuestionManagementSarvesh");

router.post("/createquestion", QuestionManagementController.createQuestion);

// Abhishek

router.post("/longanswer", QuestionManagementController.createLongAnswer);

// Shyam

// Sarvesh
router.post("/filldropdown", QuestionManagementSarveshController.createFillDropDown);

module.exports = router;
