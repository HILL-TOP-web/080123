import express from "express";

const router = express.Router();

// 👛 WALLET STATUS
router.get("/", (req, res) => {
  const { updateMining } = req.app.locals;

  const wallet = updateMining();

  res.json({
    balanceSKD: wallet.balance,
    ngn: wallet.wallet.ngn,
    usd: wallet.wallet.usd,
    locked: wallet.locked,
    lastMined: wallet.lastMined
  });
});

export default router;
