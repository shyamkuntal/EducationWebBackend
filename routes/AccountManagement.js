import express from "express";
import {
  createUser,
  createUserRole,
} from "../controller/AccountManagement/ManageAccount.js";
const router = express.Router();

router.post("/createuserrole", createUserRole);
router.post("/createuser", createUser);
export default router;
