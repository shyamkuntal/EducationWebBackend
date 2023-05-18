const express = require("express");
const AccountManagementController = require("../controller/AccountManagement/ManageAccount.js");
const router = express.Router();

router.post("/createuserrole", AccountManagementController.createUserRole);
router.post("/createuser", AccountManagementController.createUser);
module.exports = router;
