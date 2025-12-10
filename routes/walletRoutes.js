import express from "express";
import { convertSKD } from "../controllers/walletController.js";

const router = express.Router();

// /wallet/convert
router.post("/convert", convertSKD);

export default router;
