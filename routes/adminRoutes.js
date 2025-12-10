import express from "express";
import { stats } from "../controllers/adminController.js";

const router = express.Router();

router.get("/stats", stats);

export default router;
