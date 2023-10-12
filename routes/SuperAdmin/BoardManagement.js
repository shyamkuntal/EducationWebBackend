const express = require("express");
const BoardManagementController = require("../../controller/SuperAdmin/BoardM");
const { AllFilteredApi } = require("../../controller/SuperAdminReview/FilterApi");
const paginatedResults = require("../../middlewares/paginatedResults.js");
const { Board } = require("../../models/Board");
const router = express.Router();

router.get("/getallboards", paginatedResults(Board), (req, res) => {
  res.json(res.paginatedResults);
});

router.get("/getsubboards", BoardManagementController.GetSubBoards);
router.get("/getboardsandsubboards", BoardManagementController.GetBoardAndSubBords);
router.post("/createboard", BoardManagementController.CreateBoard);
router.post("/createsubboard", BoardManagementController.createSubBoard);
router.put("/editboard", BoardManagementController.UpdateBoard);
router.patch("/togglepublishboard", BoardManagementController.TogglePublishBoard);
router.patch("/togglearchiveboard", BoardManagementController.ToggleArchiveBoard);
router.patch("/togglearchivesubboard", BoardManagementController.ToggleArchiveSubBoards);
router.put("/updatesubboardname", BoardManagementController.updateSubBoardName);
router.get("/getallboardsforfiltereation", AllFilteredApi.getAllBoards);
router.get("/getAllSubBoardsforfilteration", AllFilteredApi.getAllSubBoards);
router.get("/getAllGradforfilteration", AllFilteredApi.getAllgrades);
router.get("/getAllYearforfilteration", AllFilteredApi.getAllYear);
router.get("/getAllSeasonforfilteration", AllFilteredApi.getAllSeason);
router.get("/getAllSubjectforfilteration", AllFilteredApi.getAllSubjects);
router.get("/getSubjectLevel", AllFilteredApi.getSubjectLevel);
router.get("/getAllVariant", AllFilteredApi.getAllVariant);
router.get("/getAllPaperNumber", AllFilteredApi.getAllPaperNumber);
router.get("/getAllTopicUsingSubjectID", AllFilteredApi.getAllTopicsUsingSubjectID);
router.get("/getQuestionsByFilterResult", AllFilteredApi.getQuestionsByFilterResult);

module.exports = router;
