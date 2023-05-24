const express = require("express");
const AccountManagementController = require("../controller/AccountManagement/ManageAccount.js");
const { route } = require("./PastPaperUploader.js");
const router = express.Router();

router.post("/createuserrole", AccountManagementController.createUserRole);
router.post("/createuser", AccountManagementController.createUser);
router.get("/getallroles", AccountManagementController.getallroles);
router.get(
  "/alluserrolenumber",
  AccountManagementController.getusernoroleweise
);
module.exports = router;
