const express = require("express");
const router = express.Router();
const { GeneralApi } = require("../../controller/GeneralApi");



router.get("/getallSheetbySubjectid", GeneralApi.getAllSheetBySubjectIdandUserId);
router.get("/getallPastPaperbySubjectid", GeneralApi.getAllPastPaperSheetBySubjectIdandUserId);
router.get("/getallPaperNumberbySubjectid", GeneralApi.getAllPaperNoSheetBySubjectIdandUserId);
router.get("/getallBookTasksbySubjectid", GeneralApi.getAllBookSheetBySubjectIdandUserId);
router.get("/getallTopicTasksbySubjectid", GeneralApi.getAllTopicSheetBySubjectIdandUserId);

module.exports = router;
