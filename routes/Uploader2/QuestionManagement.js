const express = require("express");
const router = express.Router();
const QuestionManagementController = require("../../controller/Uploader2/QuestionManagement");
const QuestionManagement = require("../../controller/Uploader2/Question");
const QuestionManagementSarveshController = require("../../controller/Uploader2/QuestionManagementSarvesh");
const upload = require("../../config/multer");

router.post("/createquestion", QuestionManagementController.createQuestion);

// Abhishek

router.post("/longanswer", QuestionManagementController.createLongAnswer);
router.post("/matchquestion", upload.array("optionFiles", 10), QuestionManagementController.MatchQues);

// Shyam

router.post("/mcquestion", QuestionManagement.McqQuestion);
router.delete("/deletemcquestion", QuestionManagement.DeleteMcqQues);
router.delete("/deletemcqoption", QuestionManagement.DeleteMcqOption);
router.post("/truefalse", QuestionManagement.TrueFalse);
router.delete("/deletetruefalsequestion", QuestionManagement.TrueFalseQuesDelete);
router.delete("/deletetruefalseoption", QuestionManagement.DeleteTrueFalseOption);
router.post("/image", QuestionManagement.createImageQues);

// Sarvesh

// FillDropDown Apis -
router.post("/createfilldropdown", QuestionManagementSarveshController.createFillDropDown);
router.post("/addfilldropdownoptions", QuestionManagementSarveshController.addFillDropDownOptions);
router.delete(
  "/deletefilldropdownoption",
  QuestionManagementSarveshController.deleteFillDropDownOption
);
router.get("/getfilldropdownquestion", QuestionManagementSarveshController.getfillDropDownOptions);

router.delete(
  "/deletefilldropdownquestion",
  QuestionManagementSarveshController.deleteFillDropDownQuestion
);

router.patch("/editfilldropdownoption", QuestionManagementSarveshController.editFillDropDownOption);

// FillText Apis -
router.post("/createfilltext", QuestionManagementSarveshController.createFillTextQuestion);



module.exports = router;
