const express = require("express");
const SubjectManagementController = require("../controller/SubjectManagement/ManageSubject.js");
const { Subject } = require("../models/Subject.js");
const paginatedSubjects = require("../middlewares/subjectFilter.js");
const upload = require("../config/multer.js");

const router = express.Router();

router.get("/getallsubjects", paginatedSubjects(Subject), (req, res) => {
  res.json(res.paginatedResults);
});
router.post(
  "/createsubject",
  upload.single("image"),
  SubjectManagementController.CreateSubject
);
router.put("/:id/updatesubject", SubjectManagementController.UpdateSubject);
router.patch(
  "/togglepublishsubject",
  SubjectManagementController.TogglePublishSubject
);
// //router.patch("/:id/togglearchivesubject", ToggleArchiveSubject);
router.patch(
  "/:subjectId/togglearchive/level",
  SubjectManagementController.ToggleArchiveLevel
);
router.post(
  "/createsubjectname",
  SubjectManagementController.createsubjectName
);

module.exports = router;
