export async function withdrawNGN(req, res) {
  try {
    const {
      readWallet,
      writeWallet,
      updateMining,
      SKD_TO_NGN,
      MIN_WITHDRAW_SKD,
      PAYMENT_SECRET_KEY
    } = req.app.locals;

    // ---------- CHECK ENV ----------
    if (!PAYMENT_SECRET_KEY) {
      console.error("❌ Missing PAYMENT_SECRET_KEY environment variable");
      return res.status(500).json({ error: "Server misconfiguration: missing secret key" });
    }

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

    // ---------- UPDATE MINING ----------
    const wallet = updateMining();

    if (wallet.balance < skdAmount) {
      return res.status(400).json({ error: "Insufficient SKD balance" });
    }

    // ---------- CONVERT SKD → NGN ----------
    const amountNGN = Math.floor(skdAmount * SKD_TO_NGN);

    // ---------- LOCK FUNDS ----------
    wallet.locked += skdAmount;
    writeWallet(wallet);

    // ---------- PAYSTACK TRANSFER ----------
    const transferResponse = await fetch(
      "https://api.paystack.co/transfer",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYMENT_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          source: "balance",
          reason: "SKD withdrawal",
          amount: amountNGN * 100, // kobo
          recipient: account_number, // ⚠️ for LIVE use: recipient_code
          currency: "NGN"
        })
      }
    );

    const transferData = await transferResponse.json();

    // ---------- FAILURE → ROLLBACK ----------
    if (!transferResponse.ok || !transferData.status) {
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
      reference: transferData.data?.reference || transferData.data?.id,
      timestamp: Date.now()
    });

    writeWallet(wallet);

    // ---------- SUCCESS ----------
    res.json({
      success: true,
      message: "Withdrawal successful",
      skdUsed: skdAmount,
      amountNGN,
      reference: transferData.data?.reference || transferData.data?.id
    });

  } catch (err) {
    console.error("❌ Withdraw error:", err);
    res.status(500).json({ error: "Server error" });
  }
                        }
