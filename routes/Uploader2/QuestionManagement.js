const express = require("express");
const router = express.Router();
const QuestionManagementController = require("../../controller/Uploader2/Question");
const QuestionManagementSarveshController = require("../../controller/Uploader2/QuestionManagementSarvesh");
const PastPaperSupervisorController = require("../../controller/Supervisor/PPMSupervisor");
const paginatedSheetManagementSheets = require("../../middlewares/paginatedSheetManagementSheets");
const BoardManagementController = require("../../controller/SuperAdmin/BoardM");
const upload = require("../../config/multer");

// router.post("/createquestion", QuestionManagementController.createQuestion);

router.get("/getallshmsheets", paginatedSheetManagementSheets(), (req, res) => {
  res.json(res.paginatedResults);
});

router.get("/getassignedsubjects", PastPaperSupervisorController.getUserAssignedSubjects);

router.get("/getsubjectnames", PastPaperSupervisorController.getSubjectNames);
router.post("/longanswer", QuestionManagementController.createLongAnswer);
// router.post(
//   "/matchquestion",
//   upload.array("optionFiles", 10),
//   QuestionManagementController.MatchQues
// );
router.post("/mcquestion", QuestionManagementController.McqQuestion);
router.post("/editmcquestion", QuestionManagementController.editMcqQuestion);
router.delete("/deletemcquestion", QuestionManagementController.DeleteMcqQues);
router.delete("/deletemcqoption", QuestionManagementController.DeleteMcqOption);
router.post("/editClassifyQuestion", QuestionManagementController.editClassifyQuestion);
router.delete("/deletetClassifyQuestion", QuestionManagementController.deleteClassifyQues);
router.delete("/deletetClassifyItem", QuestionManagementController.deleteClassifyIteam);
router.delete("/deletetClassifyCategory", QuestionManagementController.deleteClassifycategory);
router.delete("/deletetClassifyDisct", QuestionManagementController.deleteClassifydistractor);
router.post("/truefalse", QuestionManagementController.TrueFalse);
router.post("/edittruefalse", QuestionManagementController.editTrueFalseQuestion);
router.delete("/deletetruefalsequestion", QuestionManagementController.TrueFalseQuesDelete);
router.delete("/deletetruefalseoption", QuestionManagementController.DeleteTrueFalseOption);
router.post("/createtextquestion", QuestionManagementController.creatTextQues);
router.post("/createaccordianquestion", QuestionManagementController.createAccordian);
router.post("/updateaccordianquestion", QuestionManagementController.updateAccordian);
router.patch("/updatequestion", QuestionManagementController.updateQuestion);
router.post(
  "/createcontentquestion",
  upload.array("content", 10),
  QuestionManagementController.createContentQues
);
router.delete( "/deletecontentquestion", QuestionManagementController.deleteContentQues);
router.post(
  "/createvideoquestion",
  upload.single("content"),
  QuestionManagementController.createVideoQues
);
router.post(
  "/editvideosimulationques",
  QuestionManagementController.editVideoSimulationQues
);
router.post("/editcontentquestion", QuestionManagementController.editContentQues);
router.post("/createclassifyquestion", QuestionManagementController.createClassifyQues);

router.post("/uploadfiletos3", upload.single("file"), QuestionManagementController.uploadFileToS3);
router.post("/deletefilefroms3", QuestionManagementController.deleteFileFromS3);
// FillDropDown Apis -
router.post("/createfilldropdown", QuestionManagementController.createFillDropDown);
router.post("/addfilldropdownoptions", QuestionManagementController.addFillDropDownOptions);
router.delete("/deletefilldropdownoption", QuestionManagementController.deleteFillDropDownOption);
router.get("/getfilldropdownquestion", QuestionManagementController.getfillDropDownOptions);

router.delete(
  "/deletefilldropdownquestion",
  QuestionManagementController.deleteFillDropDownQuestion
);

router.patch("/editfilldropdownoption", QuestionManagementController.editFillDropDownOption);

// FillText Apis -
router.post("/createfilltext", QuestionManagementController.createFillTextQuestion);

router.delete("/deletefilltext", QuestionManagementController.deleteFillTextQuestion);

router.patch("/editquestion", QuestionManagementController.editQuestion);

// Match Apis -

router.post("/creatematchquestion", QuestionManagementController.createMatchQuestion);

router.patch("/editmatchquestion", QuestionManagementController.editMatchQuestion);

router.post("/addmatchquestionpairs", QuestionManagementController.addMatchQuestionPair);

router.delete("/deletematchquestionpair", QuestionManagementController.deleteMatchPair);

router.delete("/deletematchquestion", QuestionManagementController.deleteMatchQuestion);

// Drawing Apis -

router.post("/createdrawingquestion", QuestionManagementController.createDrawingQuestion);

router.patch("/editdrawingquestion", QuestionManagementController.editDrawingQuestion);

router.delete("/deletedrawingquestion", QuestionManagementController.deleteDrawingQuestion);

// Label drag Apis -

router.post("/createlabeldragquestion", QuestionManagementController.createLabelDragQuestion);

router.patch("/editlabeldragquestion", QuestionManagementController.editLabelDragQuestion);

router.delete("/deletelabeldragquestion", QuestionManagementController.deleteLabelDragQuestion);

// Label Fill Apis -

router.post("/createlabelfillquestion", QuestionManagementController.createLabelFillQuestion);

router.patch("/editlabelfillquestion", QuestionManagementController.editLabelFillQuestion);

router.delete("/deletelabelfillquestion", QuestionManagementController.deleteLabelFillQuestion);

// Geogebra Graph Apis -

router.post("/creategeogebraquestion", QuestionManagementController.createGeogebraQuestion);

router.patch("/editgeogebraquestion", QuestionManagementController.editGeogebraQuestion);

router.delete("/deletegeogebraquestion", QuestionManagementController.deleteGeogebraQuestion);

// Desmos graph Apis -

router.post("/createdesmosquestion", QuestionManagementController.createDesmosGraphQuestion);

router.patch("/editdesmosquestion", QuestionManagementController.editDesmosGraphQuestion);

router.delete("/deletedesmosquestion", QuestionManagementController.deleteDesmosQuestion);

// HotSpot Apis -

router.post("/createhotspotquestion", QuestionManagementController.createHostSpotQuestion);

router.patch("/edithotspotquestion", QuestionManagementController.editHotSpotQuestion);

router.delete("/deletehotspotquestion", QuestionManagementController.deleteHotSpotQuestion);

// Sort Apis -

router.post("/createsortquestion", QuestionManagementController.createSortQuestion);

router.patch("/editsortquestion", QuestionManagementController.editSortQuestion);

router.post("/addsortquestionoption", QuestionManagementController.addSortQuestionOption);

router.delete("/deletesortquestionoption", QuestionManagementController.deleteSortQuestionOption);

router.delete("/deletesortquestion", QuestionManagementController.deleteSortQuestion);

// getQuestion api

router.get("/getquestions", QuestionManagementController.getQuestions);

router.patch("/updatesheetinprogress", QuestionManagementController.updateSheetInprogress);

router.patch("/updatesheetcomplete", QuestionManagementController.updateSheetComplete);

router.patch("/submitsheettosupervisor", QuestionManagementController.submitToSupervisor);

router.get("/getallboards", BoardManagementController.getAllBoards);
router.get("/getallsubboards", BoardManagementController.GetSubBoards);

module.exports = router;
