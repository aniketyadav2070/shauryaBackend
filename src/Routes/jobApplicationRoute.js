import express from "express";
import upload from "../Middlewares/upload.js";
import { applyJob } from "../Controllers/jobApplicationContoller.js";

const router = express.Router();
router.post("/applyJob", upload.single("resume"), applyJob);

export default router;
