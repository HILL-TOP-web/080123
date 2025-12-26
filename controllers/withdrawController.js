import fetch from "node-fetch";

export async function withdrawNGN(req, res) {
  try {
    const {
      readWallet,
      writeWallet,
      updateMining,
      SKD_TO_NGN,
      MIN_WITHDRAW_SKD
    } = req.app.locals;

    const { skdAmount, bank_code, account_number } = req.body;

    if (!skdAmount || !bank_code || !account_number) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (skdAmount < MIN_WITHDRAW_SKD) {
      return res.status(400).json({
        error: `Minimum withdrawal is ${MIN_WITHDRAW_SKD} SKD`
      });
    }

    const wallet = updateMining();

    if (wallet.balance < skdAmount) {
      return res.status(400).json({ error: "Insufficient SKD balance" });
    }

    const amountNGN = Math.floor(skdAmount * SKD_TO_NGN);

    wallet.locked += skdAmount;
    writeWallet(wallet);

    const transferResponse = await fetch(
      "https://api.your-payment-provider.com/bank/transfer",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.PAYMENT_SECRET_KEY}`,
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

    if (!transferResponse.ok || transferData.status !== "success") {
      wallet.locked -= skdAmount;
      writeWallet(wallet);

      return res.status(500).json({
        error: "Transfer failed",
        providerResponse: transferData
      });
    }

    wallet.balance -= skdAmount;
    wallet.locked -= skdAmount;
    writeWallet(wallet);

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
        }
