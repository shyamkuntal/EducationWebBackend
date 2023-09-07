const express = require("express");
const router = express.Router();
const QuestionManagementController = require("../../controller/Uploader2/QuestionManagement");

router.post("/createquestion", QuestionManagementController.createQuestion);


// Abhishek

router.post("/longanswer", QuestionManagementController.createLongAnswer);
router.post("/filltext", QuestionManagementController.createFillText);
router.post("/connect", QuestionManagementController.createConnect);





// Shyam









// Sarvesh



















































module.exports = router;
