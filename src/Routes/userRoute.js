import express from "express";
import { adminLogin } from "../Controllers/userController.js";

const router = express.Router();
router.post("/adminLogin", adminLogin);

export default router;
