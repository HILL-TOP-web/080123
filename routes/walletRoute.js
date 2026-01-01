import express from "express";
const router = express.Router();

// GET /wallet
router.get("/", (req, res) => {
  try {
    const { readWallet } = req.app.locals;
    const wallet = readWallet();
    res.json({
      success: true,
      wallet: wallet
    });
  } catch (err) {
    console.error("❌ Wallet read error:", err);
    res.status(500).json({ success: false, error: "Failed to load wallet" });
  }
});

export default router;
