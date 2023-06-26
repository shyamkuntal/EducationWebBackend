const express = require("express");
const AccountManagementController = require("../controller/AccountManagement/ManageAccount.js");
const SubjectManagementController = require("../controller/SubjectManagement/ManageSubject.js");
const { route } = require("./PastPaperUploader.js");
const router = express.Router();
const pastPaperAccountsSheets = require("../middlewares/pastPaperAccountsSheets.js");
const reviewerAccountsSheets = require("../middlewares/reviewerAccountsSheets.js");
const supervisorAccountsSheets = require("../middlewares/supervisorAccountsSheets.js");
const paginatedSheet = require("../middlewares/paginatedSheet");

router.get("/getpastpaperaccounts", pastPaperAccountsSheets(), (req, res) => {
  res.send(res.paginatedResults);
});

router.get("/getrevieweraccounts", reviewerAccountsSheets(), (req, res) => {
  res.send(res.paginatedResults);
});

router.get("/getsupervisoraccounts", supervisorAccountsSheets(), (req, res) => {
  res.send(res.paginatedResults);
});

router.get("/getsheetsbyassignedtouserid", paginatedSheet(), (req, res) =>
  res.send(res.paginatedResults)
);

router.get("/getsubjectnames", SubjectManagementController.getsubjectName);

router.post("/createuserrole", AccountManagementController.createUserRole);

router.post("/createuser", AccountManagementController.createUser);

router.put("/edituser", AccountManagementController.editUser);

router.get("/getallroles", AccountManagementController.getallroles);

router.get(
  "/getallrolesforaddaccount",
  AccountManagementController.getallrolesbyRole
);
router.get(
  "/getrolebyname/:roleName",
  AccountManagementController.getRoleByName
);

router.get(
  "/alluserrolenumber",
  AccountManagementController.getusernoroleweise
);

router.get(
  "/getallsubjectNamebyid",
  AccountManagementController.getallsubjectNamebyid
);

router.get("/getallboards", AccountManagementController.getAllBoards);

router.get("/getsubboards", AccountManagementController.getSubBoardsById);
router.get(
  "/userboardsubboardsubject",
  AccountManagementController.getUserSubjectBoardSubBord
);

router.get("/getallsubjects", AccountManagementController.getallsubjects);

router.get("/getusers", AccountManagementController.getAllUserByRole);

// router.get(
//   "/:getsupervisorinfo",
//   AccountManagementController.getSupervisorInfo
// );

router.patch("/toggleactivate", AccountManagementController.toggleActivateUser);

module.exports = router;
