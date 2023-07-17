const express = require("express");
const router = express.Router();
const PaperNumberReviewerController = require("../controller/PaperNumberReviewer/PaperNumberReviewer");
const DataGeneratorController = require("../controller/DataGenerator/DataGeneratorManagement");
const PaperNumberManagentController = require("../controller/PaperNumberManagement/PaperNumber");
const BoardManagementController = require("../controller/BoardManagement/BoardM");
const PastPaperSupervisorController = require("../controller/PastPaperManagement/PPMSupervisor");
const SubjectManagementController = require("../controller/SubjectManagement/ManageSubject");
const paginatedPaperNumberSheet = require("../middlewares/paginatedPaperNumber");

const upload = require("../config/multer.js");

// api/pnreviewer/getsheets
router.get("/getallsheets", paginatedPaperNumberSheet(), (req, res) => {
  res.json(res.paginatedResults);
});

// api/pnreviewer/updateinprogresssheetstatus
router.patch(
  "/updateinprogresssheetstatus",
  PaperNumberReviewerController.UpdateInprogressSheetStatus
);

// api/pnreviewer/getallboards
router.get("/getallboards", BoardManagementController.getAllBoards);

// api/pnreviewer/getsubboardsbyboard
router.get("/getsubboardsbyboard", BoardManagementController.GetSubBoards);

// api/pnreviewer/getuserassignedsubjects
router.get("/getuserassignedsubjects", PastPaperSupervisorController.getUserAssignedSubjects);

// api/pnreviewer/getsubjectnames
router.get("/getsubjectnames", PastPaperSupervisorController.getSubjectNames);

// api/pnreviewer/getpapernumberbypnsheetid
router.get(
  "/getpapernumberbypnsheetid",
  DataGeneratorController.getPaperNumberByPaperNumberSheet
);

// api/pnreviewer/adderrorstopapernumbers
router.patch("/adderrorstopapernumbers", PaperNumberReviewerController.addErrorsToPaperNumbers);

// api/pnreviewer/reportsheeterror
router.patch(
  "/reportpapernumumbersheeterror",
  upload.single("errorReportFile"),
  PaperNumberReviewerController.reportSheetError
);

// api/pnreviewer/addrecheckcomment
router.post("/addrecheckcomment", PaperNumberReviewerController.addRecheckComment);

// api/pnreviewer/getrecheckcomment
router.get("/getrecheckcomment", PaperNumberReviewerController.getRecheckComment);

// api/pnreviewer/updatecompletestatus
router.patch("/updatecompletestatus", PaperNumberReviewerController.updateCompleteSheetStatus);

// api/pnreviewer/submitsheettosupervisor
router.patch("/submitsheettosupervisor", PaperNumberReviewerController.submitSheetToSupervisor);

// api/pnreviewer/geterrorreportfile
router.get("/geterrorreportfile", PaperNumberReviewerController.getErrorReportFile);

// api/pnreviewer/getsubjectnamebyid
router.get("/getsubjectnamebyid", SubjectManagementController.getSubjectNameById);

module.exports = router;
