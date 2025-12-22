// routes/miningRoute.js

import express from "express";
import { mineSKD } from "../controllers/miningController.js";

// Create router instance
const router = express.Router();

/*
|--------------------------------------------------------------------------
| ⛏️ AUTO-MINING ROUTE
|--------------------------------------------------------------------------
| This endpoint triggers time-based mining.
| Mining happens automatically based on last mined timestamp.
|
| METHOD: POST
| URL: /mine
|--------------------------------------------------------------------------
*/
router.post("/", async (req, res) => {
  try {
    // Call mining controller
    await mineSKD(req, res);
  } catch (error) {
    console.error("❌ Mining error:", error);
    res.status(500).json({ error: "Mining failed" });
  }
});

// Export router
export default router;
