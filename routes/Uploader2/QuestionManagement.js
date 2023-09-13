const express = require("express");
const router = express.Router();
const QuestionManagementController = require("../../controller/Uploader2/QuestionManagement");
const QuestionManagement = require("../../controller/Uploader2/Question");
const QuestionManagementSarveshController = require("../../controller/Uploader2/QuestionManagementSarvesh");
const upload = require("../../config/multer");

router.post("/createquestion", QuestionManagementController.createQuestion);

// Abhishek

router.post("/longanswer", QuestionManagementController.createLongAnswer);
router.post(
  "/matchquestion",
  upload.array("optionFiles", 10),
  QuestionManagementController.MatchQues
);

// Shyam

router.post("/mcquestion", QuestionManagement.McqQuestion);
router.post("/editmcquestion", QuestionManagement.editMcqQuestion);
router.delete("/deletemcquestion", QuestionManagement.DeleteMcqQues);
router.delete("/deletemcqoption", QuestionManagement.DeleteMcqOption);
router.post("/truefalse", QuestionManagement.TrueFalse);
router.post("/edittruefalse", QuestionManagement.editTrueFalseQuestion);
router.delete("/deletetruefalsequestion", QuestionManagement.TrueFalseQuesDelete);
router.delete("/deletetruefalseoption", QuestionManagement.DeleteTrueFalseOption);
router.post("/createtextquestion", QuestionManagement.creatTextQues);
router.patch("/updatequestion", QuestionManagement.updateQuestion);
router.post("/createcontentquestion", QuestionManagement.createContentQues);
router.post("/editcontentquestion", QuestionManagement.editContentQues);
router.post("/createclassifyquestion", QuestionManagement.createClassifyQues);

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

router.delete("/deletefilltext", QuestionManagementSarveshController.deleteFillTextQuestion);

router.patch("/editquestion", QuestionManagementSarveshController.editQuestion);

// Match Apis -

router.post("/creatematchquestion", QuestionManagementSarveshController.createMatchQuestion);

router.patch("/editmatchquestion", QuestionManagementSarveshController.editMatchQuestion);

router.post("/addmatchquestionpairs", QuestionManagementSarveshController.addMatchQuestionPair);

router.delete("/deletematchquestionpair", QuestionManagementSarveshController.deleteMatchPair);

router.delete("/deletematchquestion", QuestionManagementSarveshController.deleteMatchQuestion);

// Drawing Apis -

router.post("/createdrawingquestion", QuestionManagementSarveshController.createDrawingQuestion);

router.patch("/editdrawingquestion", QuestionManagementSarveshController.editDrawingQuestion);

router.delete("/deletedrawingquestion", QuestionManagementSarveshController.deleteDrawingQuestion);

// Label drag Apis -

router.post(
  "/createlabeldragquestion",
  QuestionManagementSarveshController.createLabelDragQuestion
);

router.patch("/editlabeldragquestion", QuestionManagementSarveshController.editLabelDragQuestion);

router.delete(
  "/deletelabeldragquestion",
  QuestionManagementSarveshController.deleteLabelDrawQuestion
);

// Label Fill Apis -

router.post(
  "/createlabelfillquestion",
  QuestionManagementSarveshController.createLabelFillQuestion
);

router.patch("/editlabelfillquestion", QuestionManagementSarveshController.editLabelFillQuestion);

router.delete(
  "/deletelabelfillquestion",
  QuestionManagementSarveshController.deleteLabelFillQuestion
);

// Geogebra Graph Apis -

router.post("/creategeogebraquestion", QuestionManagementSarveshController.createGeogebraQuestion);

router.patch("/editgeogebraquestion", QuestionManagementSarveshController.editGeogebraQuestion);

module.exports = router;
