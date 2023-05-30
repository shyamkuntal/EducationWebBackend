const express = require("express");
const AccountManagementController = require("../controller/AccountManagement/ManageAccount.js");
const { route } = require("./PastPaperUploader.js");
const router = express.Router();

router.post("/createuserrole", AccountManagementController.createUserRole);
router.post("/createuser", AccountManagementController.createUser);
router.put("/edituser", AccountManagementController.editUser);
router.get("/:roleId/getallroles", AccountManagementController.getallroles);
// router.get('/:roleId/getallroles',AccountManagementController.getallroles);
router.get(
  "/alluserrolenumber",
  AccountManagementController.getusernoroleweise
);
router.get("/getallsubjects", AccountManagementController.getallsubjects);
router.get("/:roleId/getusers", AccountManagementController.getAllUserByRole);
router.get(
  "/:getsupervisorinfo",
  AccountManagementController.getSupervisorInfo
);
router.patch("/toggleactivate", AccountManagementController.toggleActivateUser);
module.exports = router;
