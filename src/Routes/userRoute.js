import express from "express";
import { adminLogin,allCandidates,deleteCandidate,updateCandidateStatus,getCandidateById,dashboardData } from "../Controllers/userController.js";
import {authenticate} from '../Middlewares/authenticate.js'

const router = express.Router();
router.post("/adminLogin", adminLogin);
router.get("/allCandidates",authenticate,allCandidates)
router.delete("/deleteCandidate/:id", authenticate, deleteCandidate);
router.patch("/updateStatus/:id", authenticate, updateCandidateStatus);
router.get("/getCandidateById/:id", authenticate, getCandidateById);
router.get('/dashboardData',authenticate,dashboardData)

export default router;
