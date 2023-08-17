const express = require("express");
const router = express.Router();
const PaperNumberReviewerController = require("../../controller/Reviewer/PaperNumberReviewer/PaperNumberReviewer");
const DataGeneratorController = require("../../controller/DataGenerator/PaperNoManagement");
const PaperNumberManagentController = require("../../controller/Supervisor/PaperNumberManagement/PaperNumber");
const BoardManagementController = require("../../controller/SuperAdmin/BoardManagement/BoardM");
const PastPaperSupervisorController = require("../../controller/Supervisor/PastPaperManagement/PPMSupervisor");
const SubjectManagementController = require("../../controller/Supervisor/SubjectManagement/ManageSubject");
const paginatedPaperNumberSheet = require("../../middlewares/paginatedPaperNumber");

const upload = require("../../config/multer.js");

// api/pnreviewer/getsheets
router.get("/getallsheets", paginatedPaperNumberSheet(), (req, res) => {
  res.json(res.paginatedResults);
});

// api/pnreviewer/updateinprogresssheetstatus
router.patch(
  "/updateinprogresssheetstatus",
  PaperNumberReviewerController.UpdateInprogressSheetStatus
);

// api/pnreviewer/getsubjectnames
router.get("/getsubjectnames", PastPaperSupervisorController.getSubjectNames);

// api/pnreviewer/getpapernumberbypnsheetid
router.get("/getpapernumberbypnsheetid", DataGeneratorController.getPaperNumberByPaperNumberSheet);

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

// api/pnreviewer/updatecompletestatus
router.patch("/updatecompletestatus", PaperNumberReviewerController.updateCompleteSheetStatus);

// api/pnreviewer/submitsheettosupervisor
router.patch("/submitsheettosupervisor", PaperNumberReviewerController.submitSheetToSupervisor);

// api/pnreviewer/geterrorreportfile
router.get("/geterrorreportfile", PaperNumberReviewerController.getErrorReportFile);

// api/pnreviewer/getsubjectnamebyid
router.get("/getsubjectnamebyid", SubjectManagementController.getSubjectNameById);

module.exports = router;
