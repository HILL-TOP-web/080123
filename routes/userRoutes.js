import express from "express";
import { getUserBalance } from "../controllers/userController.js";

const router = express.Router();

// /user/balance/:userId
router.get("/balance/:userId", getUserBalance);

export default router;
