const express = require("express");
const router = express.Router();

const paginatedPastPaperResults = require("../middlewares/paginatedPastPapers");
const BoardManagementController = require("../controller/BoardManagement/BoardM");
const SubjectManagementController = require("../controller/SubjectManagement/ManageSubject");

// /api/public/getpastpapers
router.get("/getpastpapers", paginatedPastPaperResults(), (req, res) => {
  res.json(res.paginatedResults);
});

// /api/public/getallboards
router.get("/getallboards", BoardManagementController.getAllBoards);

// /api/public/getsubboards
router.get("/getsubboards/:boardId", BoardManagementController.GetSubBoards);

// /api/public/getsubjectNames
router.get(
  "/getsubjectnames",
  SubjectManagementController.getSubjectNamesWithOutImageUrl
);

// /api/public/getallsubjectlevels
router.get(
  "/getallsubjectlevels",
  SubjectManagementController.getAllSubjectLevels
);

module.exports = router;
