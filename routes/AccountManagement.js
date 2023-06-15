const express = require("express");
const AccountManagementController = require("../controller/AccountManagement/ManageAccount.js");
const { route } = require("./PastPaperUploader.js");
const router = express.Router();
const pastPaperAccountsSheets = require("../middlewares/pastPaperAccountsSheets.js");

router.get("/getpastpaper", pastPaperAccountsSheets(), (req, res) => {
  res.send(res.paginatedResults);
});
router.post("/createuserrole", AccountManagementController.createUserRole);
router.post("/createuser", AccountManagementController.createUser);
router.put("/edituser", AccountManagementController.editUser);
router.get("/getallroles", AccountManagementController.getallroles);
router.get(
  "/:roleId/getallrolesbyrole",
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

router.get("/getallsubjects", AccountManagementController.getallsubjects);

router.get("/getusers", AccountManagementController.getAllUserByRole);

// router.get(
//   "/:getsupervisorinfo",
//   AccountManagementController.getSupervisorInfo
// );
router.get("/getallboards", AccountManagementController.getAllBoards);
router.get("/getsubboards", AccountManagementController.getSubBoardsById);

router.patch("/toggleactivate", AccountManagementController.toggleActivateUser);
module.exports = router;
