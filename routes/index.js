import BoardRouters from "./BoardManagement.js";
import SubjectRouters from "./SubjectManagement.js";
import PPMSupervisor from "./PPMSupervisor.js";
import AccountManagement from "./AccountManagement.js";
import express from "express";
import PastPaperUploader from "./PastPaperUploader.js";
const router = express.Router();
router.use("/boardmanagement", BoardRouters);
router.use("/subjectmanagement", SubjectRouters);
router.use("/ppmsupervisor", PPMSupervisor);
router.use("/accountmanagement", AccountManagement);
router.use("/ppuploader", PastPaperUploader);

export default router;
