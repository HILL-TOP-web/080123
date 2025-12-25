import express from "express";

const router = express.Router();

// 💸 WITHDRAW (REAL MONEY)
router.post("/", async (req, res) => {
  const { amountNGN, accountNumber, bankCode } = req.body;

  const { updateMining, writeWallet, SKD_TO_NGN, MIN_WITHDRAW_SKD } = req.app.locals;

  const wallet = updateMining();

  // ---- VALIDATION ----
  if (!amountNGN || !accountNumber || !bankCode) {
    return res.status(400).json({ error: "Missing fields" });
  }

  if (amountNGN < MIN_WITHDRAW_SKD * SKD_TO_NGN) {
    return res.status(400).json({ error: "Below minimum withdrawal" });
  }

  if (amountNGN > wallet.wallet.ngn) {
    return res.status(400).json({ error: "Insufficient wallet balance" });
  }

  // ---- DEDUCT FIRST ----
  wallet.wallet.ngn -= amountNGN;
  writeWallet(wallet);

  try {
    const response = await fetch("MONIEPOINT_PAYOUT_ENDPOINT", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.MONIEPOINT_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: amountNGN,
        accountNumber,
        bankCode,
        narration: "SKD Withdrawal"
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Payout failed");
    }

    res.json({
      message: "Withdrawal successful",
      reference: result.reference || null,
      data: result
    });

  } catch (err) {
    // ---- ROLLBACK ----
    wallet.wallet.ngn += amountNGN;
    writeWallet(wallet);

    res.status(500).json({
      error: "Withdrawal failed",
      details: err.message
    });
  }
});

export default router;
