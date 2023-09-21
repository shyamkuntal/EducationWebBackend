const express = require("express");
const NoticeController = require("../../controller/Supervisor/NoticeBoard");
const router = express.Router();

router.post("/createnotice", NoticeController.createNotice);
router.get("/allnotices", NoticeController.getAllNotices);
router.get("/noticebyname", NoticeController.getNoticeByName);
router.get("/datagenerator", NoticeController.getDataGeneratorNotices);
router.get("/reviewer", NoticeController.getReviewerNotices);
router.get("/teacher", NoticeController.getTeacherNotices);
router.get("/uploader", NoticeController.getUploaderNotices);
router.get("/pastpaper", NoticeController.getPastPaperNotices);
router.get("/pricer", NoticeController.getPricerNotices);
router.get("/noticebyrole", NoticeController.getNoticeByNameAndRole);
router.patch("/deleteforsender", NoticeController.deleteNoticeForSender);

module.exports = router;
