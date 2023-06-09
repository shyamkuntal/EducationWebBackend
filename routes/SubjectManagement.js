const express = require("express");
const SubjectManagementController = require("../controller/SubjectManagement/ManageSubject.js");
const { Subject } = require("../models/Subject.js");
const getPaginatedSubjects = require("../middlewares/subjectFilter.js");
const upload = require("../config/multer.js");

const router = express.Router();

router.get("/getallsubjects", getPaginatedSubjects(Subject), (req, res) => {
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

//router.patch("/:id/togglearchivesubject", ToggleArchiveSubject);
router.patch(
  "/togglearchiveSubjectLevels",
  SubjectManagementController.ToggleArchiveLevel
);

router.post(
  "/createsubjectname",
  SubjectManagementController.createsubjectName
);

router.get(
  "/getsubjectdetailsbyids",
  SubjectManagementController.getSubjectDetailsByBoardSubBoardGrade
);

router.get("/getsubjectnames", SubjectManagementController.getsubjectName);

router.get("/getallboards", SubjectManagementController.getAllboards);

router.get("/getallsubboards", SubjectManagementController.getAllSubBoards);

router.post("/getsubjectname", SubjectManagementController.getsubjectName);

router.get(
  "/getsubjectbysubjectnameid",
  SubjectManagementController.getSubjectBySubjectNameId
);
module.exports = router;
