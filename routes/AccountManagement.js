import express from "express";
import { createUserRole } from "../controller/AccountManagement/ManageAccount.js";
const router = express.Router();

router.post("/createuserrole", createUserRole);
export default router;
