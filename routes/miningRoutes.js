import express from "express";
import { mineSKD } from "../controllers/miningController.js";

const router = express.Router();

// /mine/:userId
router.post("/:userId", mineSKD);

export default router;
