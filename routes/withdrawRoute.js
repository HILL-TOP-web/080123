import express from "express";

const router = express.Router();

/**
 * POST /withdraw/ngn
 * Body:
 * {
 *   skdAmount: 0.01,
 *   recipientCode: "RCP_xxxxxxxx"
 * }
 */
router.post("/ngn", async (req, res) => {
  try {
    const {
      readWallet,
      writeWallet,
      updateMining,
      SKD_TO_NGN,
      MIN_WITHDRAW_SKD,
      PAYMENT_SECRET_KEY,
      PAYSTACK_BASE_URL
    } = req.app.locals;

    // ---------- ENV CHECK ----------
    if (!PAYMENT_SECRET_KEY || !PAYSTACK_BASE_URL) {
      return res.status(500).json({
        error: "Server misconfiguration (Paystack env missing)"
      });
    }

    const { skdAmount, recipientCode } = req.body;

    // ---------- VALIDATION ----------
    if (!skdAmount || !recipientCode) {
      return res.status(400).json({
        error: "skdAmount and recipientCode are required"
      });
    }

    if (skdAmount < MIN_WITHDRAW_SKD) {
      return res.status(400).json({
        error: `Minimum withdrawal is ${MIN_WITHDRAW_SKD} SKD`
      });
    }

    // ---------- UPDATE MINING ----------
    const wallet = updateMining();

    if (wallet.balance < skdAmount) {
      return res.status(400).json({ error: "Insufficient SKD balance" });
    }

    // ---------- CONVERT SKD → NGN ----------
    const amountNGN = Math.floor(skdAmount * SKD_TO_NGN);
    const amountInKobo = amountNGN * 100;

    // ---------- LOCK FUNDS ----------
    wallet.locked = (wallet.locked || 0) + skdAmount;
    writeWallet(wallet);

    // ---------- PAYSTACK TRANSFER ----------
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transfer`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYMENT_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          source: "balance",
          amount: amountInKobo,
          recipient: recipientCode,
          reason: "Mine App Withdrawal"
        })
      }
    );

    const transferData = await response.json();

    // ---------- FAILURE → ROLLBACK ----------
    if (!response.ok || !transferData.status) {
      wallet.locked -= skdAmount;
      writeWallet(wallet);

      return res.status(500).json({
        error: "Transfer failed",
        providerResponse: transferData
      });
    }

    // ---------- FINALIZE WALLET ----------
    wallet.balance -= skdAmount;
    wallet.locked -= skdAmount;

    if (!wallet.transactions) wallet.transactions = [];
    wallet.transactions.push({
      type: "withdraw",
      skd: skdAmount,
      ngn: amountNGN,
      reference: transferData.data.reference,
      status: "success",
      timestamp: Date.now()
    });

    writeWallet(wallet);

    // ---------- SUCCESS ----------
    res.json({
      success: true,
      message: "Withdrawal successful",
      skdUsed: skdAmount,
      amountNGN,
      reference: transferData.data.reference
    });

  } catch (err) {
    console.error("❌ Withdraw error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
