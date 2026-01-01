import express from "express";

const router = express.Router();

/**
 * POST /withdraw/ngn
 * Body:
 * {
 *   skdAmount: 0.01,
 *   name: "User Name",
 *   account_number: "0123456789",
 *   bank_code: "044"
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
      return res.status(500).json({ error: "Server misconfiguration (Paystack env missing)" });
    }

    const { skdAmount, name, account_number, bank_code } = req.body;

    // ---------- VALIDATION ----------
    if (!skdAmount || !name || !account_number || !bank_code) {
      return res.status(400).json({ error: "All withdrawal fields are required" });
    }

    if (skdAmount < MIN_WITHDRAW_SKD) {
      return res.status(400).json({ error: `Minimum withdrawal is ${MIN_WITHDRAW_SKD} SKD` });
    }

    // ---------- UPDATE MINING ----------
    const wallet = updateMining();

    if (wallet.balance < skdAmount) {
      return res.status(400).json({ error: "Insufficient SKD balance" });
    }

    // ---------- CONVERT SKD → NGN ----------
    const amountNGN = Math.floor(skdAmount * SKD_TO_NGN); // NGN amount only
    const amountInKobo = amountNGN * 100;                // Paystack requires Kobo

    // ---------- LOCK FUNDS ----------
    wallet.lockedAmount = (wallet.lockedAmount || 0) + skdAmount;
    writeWallet(wallet);

    // ---------- CREATE PAYSTACK RECIPIENT ----------
    const recipientRes = await fetch(`${PAYSTACK_BASE_URL}/transferrecipient`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYMENT_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: "nuban",
        name,
        account_number,
        bank_code,
        currency: "NGN"
      })
    });

    const recipientData = await recipientRes.json();

    if (!recipientData.status) {
      wallet.lockedAmount -= skdAmount;
      writeWallet(wallet);
      return res.status(400).json({ error: "Recipient creation failed", providerResponse: recipientData });
    }

    const recipientCode = recipientData.data.recipient_code;

    // ---------- PAYSTACK TRANSFER ----------
    const transferRes = await fetch(`${PAYSTACK_BASE_URL}/transfer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYMENT_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        source: "balance",
        amount: amountInKobo,
        recipient: recipientCode,
        reason: "Mine App Withdrawal" // SKD NOT included here
      })
    });

    const transferData = await transferRes.json();

    if (!transferData.status) {
      wallet.lockedAmount -= skdAmount;
      writeWallet(wallet);
      return res.status(500).json({ error: "Transfer failed", providerResponse: transferData });
    }

    // ---------- FINALIZE WALLET ----------
    wallet.balance -= skdAmount;
    wallet.lockedAmount -= skdAmount;

    if (!wallet.transactions) wallet.transactions = [];
    wallet.transactions.push({
      type: "withdraw",
      skd: skdAmount,       // Internal only
      ngn: amountNGN,       // NGN sent to Paystack
      reference: transferData.data.reference,
      status: "success",
      timestamp: Date.now()
    });

    writeWallet(wallet);

    res.json({
      success: true,
      message: "Withdrawal successful",
      skdUsed: skdAmount,   // Only internal display
      amountNGN,
      reference: transferData.data.reference
    });

  } catch (err) {
    console.error("❌ Withdraw error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

export default router;
