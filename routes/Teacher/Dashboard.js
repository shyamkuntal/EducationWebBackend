const express = require("express");
const router = express.Router();
const { DashboardApi } = require("../../controller/Teacher/Dashboard");


router.get("/getallSheetByTeacherId", DashboardApi.getAllSubjectByUserId);
router.get("/getallQuestionManagement", DashboardApi.getAllSheetByUserId);
router.get("/getallReportedError", DashboardApi.getAllSheetOfReportedError);
router.get("/getallSpamQuestionByUser", DashboardApi.getAllSpamQuestionByUSer);
router.get("/getallSheetbySubjectid", DashboardApi.getAllSheetBySubjectIdandUserId);
router.get("/getallReportedErrorbySubjectid", DashboardApi.getAllReportedErrorBySubjectIdandUserId);
router.get("/getallSpamQuestionbySubjectid", DashboardApi.getAllSpamQuestionBySubjectIdandUserId);
router.get("/getallBoardForTeacher", DashboardApi. getAllBoards);
router.get("/getallSubBoardForTeacher", DashboardApi.getAllSubBoards);
router.get("/getallSubjectForTeacher", DashboardApi.getAllSubjects);
router.get("/getallNoticeForTeacher", DashboardApi.getAllNoticeForTeacher);
router.delete("/deleteNoticeFromReciver", DashboardApi.deleteNoticeFromReciver);


module.exports = router;
