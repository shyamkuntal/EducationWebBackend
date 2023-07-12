const express = require("express");
const AccountManagementController = require("../controller/AccountManagement/ManageAccount.js");
const SubjectManagementController = require("../controller/SubjectManagement/ManageSubject.js");
const { route } = require("./PastPaperUploader.js");
const router = express.Router();
const paginatedPastPaperAccounts = require("../middlewares/paginatedPastPaperAccounts.js");
const paginatedReviewerAccounts = require("../middlewares/paginatedReviewerAccounts.js");
const paginatedSupervisorAccounts = require("../middlewares/paginatedSupervisorAccounts.js");
const paginatedDataGeneratorAccounts = require("../middlewares/paginatedDataGeneratorAccounts.js");
const paginatedTeacherAccounts = require("../middlewares/paginatedTeacherAccounts.js");
const paginatedPricerAccounts = require("../middlewares/paginatedPricerAccounts.js");
const paginatedUploader2Accounts = require("../middlewares/paginatedUploader2Accounts.js");
const paginatedSheet = require("../middlewares/paginatedSheet");

router.get(
  "/getpastpaperaccounts",
  paginatedPastPaperAccounts(),
  (req, res) => {
    res.send(res.paginatedResults);
  }
);

router.get(
  "/getuploader2accounts",
  paginatedUploader2Accounts(),
  (req, res) => {
    res.send(res.paginatedResults);
  }
);

router.get("/getrevieweraccounts", paginatedReviewerAccounts(), (req, res) => {
  res.send(res.paginatedResults);
});

router.get("/getpriceraccounts", paginatedPricerAccounts(), (req, res) => {
  res.send(res.paginatedResults);
});

router.get(
  "/getdatageneratoraccounts",
  paginatedDataGeneratorAccounts(),
  (req, res) => {
    res.send(res.paginatedResults);
  }
);

router.get(
  "/getsupervisoraccounts",
  paginatedSupervisorAccounts(),
  (req, res) => {
    res.send(res.paginatedResults);
  }
);

router.get("/getteacheraccounts", paginatedTeacherAccounts(), (req, res) => {
  res.send(res.paginatedResults);
});

router.get("/getsheetsbyassignedtouserid", paginatedSheet(), (req, res) =>
  res.send(res.paginatedResults)
);

router.get("/getsubjectnames", SubjectManagementController.getsubjectName);

router.post("/createuserrole", AccountManagementController.createUserRole);

router.post("/createuser", AccountManagementController.createUser);

router.put("/edituser", AccountManagementController.editUser);

router.get(
  "/getallrolesforaddaccount",
  AccountManagementController.getallrolesbyRole
);

router.get("/getuserCount", AccountManagementController.getUserCount);

router.get(
  "/getallsubjectNamebyid",
  AccountManagementController.getallsubjectNamebyid
);

router.get("/getallboards", AccountManagementController.getAllBoards);

router.get("/getsubboards", AccountManagementController.getSubBoardsById);
router.get(
  "/getuserboardsubboardsubjectqualification",
  AccountManagementController.getUserSubjectBoardSubBordQualification
);

router.get("/getallsubjects", AccountManagementController.getallsubjects);

router.get("/getusers", AccountManagementController.getAllUserByRole);

router.get("/getsupervisorinfo", AccountManagementController.getSupervisorInfo);

router.patch("/toggleactivate", AccountManagementController.toggleActivateUser);

module.exports = router;
