const express = require("express");
const router = express.Router();
const QuestionManagementController = require("../../controller/Uploader2/QuestionManagement");
const QuestionManagement = require("../../controller/Uploader2/Question");
const QuestionManagementSarveshController = require("../../controller/Uploader2/QuestionManagementSarvesh");
const upload = require("../../config/multer");

router.post("/createquestion", QuestionManagementController.createQuestion);

// Abhishek

router.post("/longanswer", QuestionManagementController.createLongAnswer);

// Shyam

router.post("/mcquestion", upload.array("optionFiles", 10), QuestionManagement.McqQuestion);

// Sarvesh
router.post("/filldropdown", QuestionManagementSarveshController.createFillDropDown);

module.exports = router;
