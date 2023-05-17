import BoardRouters from "./BoardManagement.js";
import SubjectRouters from "./SubjectManagement.js";
import PPMSupervisor from "./PPMSupervisor.js";
import AccountManagement from "./AccountManagement.js";
import express from "express";
import { checkValidRole } from "../middlewares/checkvalidrole.js";

const router = express.Router();
router.use("/boardmanagement", checkValidRole([7]), BoardRouters);
router.use("/subjectmanagement", checkValidRole([7]), SubjectRouters);
router.use("/ppmsupervisor", checkValidRole([7]), PPMSupervisor);
router.use("/accountmanagement", checkValidRole([7]), AccountManagement);

export default router;
