import express from "express";
import fetch from "node-fetch"; // only needed if Node < 18

const router = express.Router();

/**
 * POST /withdraw/ngn
 * Body:
 * {
 *   skdAmount: 0.01,
 *   bank_code: "090405",
 *   account_number: "8107300218"
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
      PAYMENT_SECRET_KEY // <- loaded from .env in server.js
    } = req.app.locals;

    const { skdAmount, bank_code, account_number } = req.body;

    // ---------- BASIC VALIDATION ----------
    if (!skdAmount || !bank_code || !account_number) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (skdAmount < MIN_WITHDRAW_SKD) {
      return res.status(400).json({
        error: `Minimum withdrawal is ${MIN_WITHDRAW_SKD} SKD`
      });
    }

    // ---------- UPDATE MINING FIRST ----------
    const wallet = updateMining();

    if (wallet.balance < skdAmount) {
      return res.status(400).json({ error: "Insufficient SKD balance" });
    }

    // ---------- CONVERT SKD → NGN ----------
    const amountNGN = Math.floor(skdAmount * SKD_TO_NGN);

    // ---------- LOCK FUNDS (ANTI DOUBLE-SPEND) ----------
    wallet.locked += skdAmount;
    writeWallet(wallet);

    // ---------- REAL BANK TRANSFER (Moniepoint) ----------
    const transferResponse = await fetch(
      "https://api.moniepoint.com/v2/transfer", // Moniepoint endpoint
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${PAYMENT_SECRET_KEY}`, // using .env
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: amountNGN,
          bank_code,
          account_number,
          currency: "NGN"
        })
      }
    );

    const transferData = await transferResponse.json();

    // ---------- VERIFY TRANSFER ----------
    if (!transferResponse.ok || transferData.status !== "success") {
      // rollback lock
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

    // ---------- LOG TRANSACTION ----------
    if (!wallet.transactions) wallet.transactions = [];
    wallet.transactions.push({
      type: "withdraw",
      skd: skdAmount,
      ngn: amountNGN,
      status: "success",
      reference: transferData.reference || transferData.id,
      timestamp: Date.now()
    });

    writeWallet(wallet);

    // ---------- SUCCESS ----------
    res.json({
      success: true,
      message: "Withdrawal successful",
      skdUsed: skdAmount,
      amountNGN,
      reference: transferData.reference || transferData.id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
