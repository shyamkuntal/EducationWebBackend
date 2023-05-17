import express from "express";
import {
  CreateSubject,
  ToggleArchiveLevel,
  TogglePublishSubject,
  UpdateSubject,
} from "../controller/SubjectManagement/ManageSubject.js";
import { Subject } from "../models/Subject.js";
import { paginatedSubjects } from "../middlewares/subjectFilter.js";
import upload from "../config/multer.js";

const router = express.Router();

router.get("/getallsubjects", paginatedSubjects(Subject), (req, res) => {
  res.json(res.paginatedResults);
});
router.post("/createsubject", upload.single("image"), CreateSubject);
router.put("/:id/updatesubject", UpdateSubject);
router.patch("/togglepublishsubject", TogglePublishSubject);
// //router.patch("/:id/togglearchivesubject", ToggleArchiveSubject);
router.patch("/:subjectId/togglearchive/level", ToggleArchiveLevel);

export default router;
