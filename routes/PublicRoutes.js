const express = require("express");
const router = express.Router();

const paginatedPastPaperResults = require("../middlewares/paginatedPastPapers");
const BoardManagementController = require("../controller/SuperAdmin/BoardM");
const SubjectManagementController = require("../controller/Supervisor/ManageSubject");
const AccountManagementController = require("../controller/Supervisor/ManageAccount");
const PaperNumberSheetController = require("../controller/Supervisor/PaperNumber");
const PastPaperSupervisorController = require("../controller/Supervisor/PPMSupervisor");
const upload = require("../config/multer.js");

// /api/public/getallroles
router.get("/getallroles", AccountManagementController.getallroles);

// /api/public/getrolebyname/:roleName
router.get("/getrolebyname/:roleName", AccountManagementController.getRoleByName);

// /api/public/getpastpapers
router.get("/getpastpapers", paginatedPastPaperResults(), (req, res) => {
  res.json(res.paginatedResults);
});

// /api/public/getallboards
router.get("/getallboards", BoardManagementController.getAllBoards);

// /api/public/getsubboards
router.get("/getsubboards", BoardManagementController.GetSubBoards);

// /api/public/getsubjectNames
router.get("/getsubjectnames", SubjectManagementController.getSubjectNamesWithOutImageUrl);

// /api/public/getallsubjectlevels
router.get("/getallsubjectlevels", SubjectManagementController.getAllSubjectLevels);

router.get("/getdistinctpapernumbers", PaperNumberSheetController.getDistinctPaperNumbers);

router.get("/getboardnamebytype", BoardManagementController.getBoardsByType);

router.get("/getallvariants", PastPaperSupervisorController.getAllVariants);

// router.post("/createuserrole", AccountManagementController.createUserRole);

// router.post("/createuser", AccountManagementController.createUser);

// router.post(
//   "/createsubject",
//   upload.fields([
//     { name: "image", maxCount: 1 },
//     { name: "newImage", maxCount: 1 },
//   ]),
//   SubjectManagementController.CreateSubject
// );

module.exports = router;
