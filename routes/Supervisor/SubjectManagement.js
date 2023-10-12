const express = require("express");
const SubjectManagementController = require("../../controller/Supervisor/ManageSubject");
const getPaginatedSubjects = require("../../middlewares/subjectFilter.js");
const upload = require("../../config/multer.js");

const router = express.Router();

router.get("/getallsubjects", getPaginatedSubjects(), (req, res) => {
  res.json(res.paginatedResults);
});

router.post(
  "/createsubject",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "newImage", maxCount: 1 },
  ]),
  SubjectManagementController.CreateSubject
);

router.put("/updatesubject", upload.single("image"), SubjectManagementController.UpdateSubject);

router.patch("/togglepublishsubject", SubjectManagementController.TogglePublishSubject);


router.post("/createsubjectname", SubjectManagementController.createsubjectName);

router.get(
  "/getsubjectdetailsbyids",
  SubjectManagementController.getSubjectDetailsByBoardSubBoardGrade
  );
  
  router.get(
    "/getsubjectdetailsbyidsnotpublished",
    SubjectManagementController.getSubjectDetailsByBoardSubBoardGradeNotPublished
    );
    
    router.get("/getsubjectnames", SubjectManagementController.getsubjectName);
    
    router.get("/getallboards", SubjectManagementController.getAllboards);
    
    router.get("/getallsubboards", SubjectManagementController.getAllSubBoards);
    
    router.get("/getsubjectbysubjectnameid", SubjectManagementController.getSubjectBySubjectNameId);
    
    router.get(
      "/getsubjectdetails",
      SubjectManagementController.getSubjectDetailsByBoardSubBoardGradeSubjectNameId
      );
      
      router.get("/getsubjectnamebyid", SubjectManagementController.getSubjectNameById);
      module.exports = router;
      
      router.patch("/togglearchiveSubjectLevels", SubjectManagementController.ToggleArchiveLevel);
      router.patch("/archiveSubject", SubjectManagementController.SubjectArchive);