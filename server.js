import express from "express";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Routes
import walletRoute from "./routes/walletRoute.js";
import withdrawRoute from "./routes/withdrawRoute.js";

dotenv.config();

// ---------- PATH SETUP ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- APP SETUP ----------
const app = express();
const PORT = process.env.PORT || 3000;

// ---------- REQUIRED ENV CHECK ----------
if (!process.env.PAYSTACK_SECRET_KEY) {
  console.error("❌ PAYSTACK_SECRET_KEY missing in .env");
  process.exit(1);
}

// ---------- MIDDLEWARE ----------
app.use(express.json());

// ✅ SERVE FRONTEND (Paystack Checkout HTML)
app.use(express.static(path.join(__dirname, "public")));

// ---------- WALLET FILE ----------
const WALLET_FILE = path.join(__dirname, "wallet.json");

// ---------- WALLET HELPERS ----------
function readWallet() {
  if (!fs.existsSync(WALLET_FILE)) {
    fs.writeFileSync(
      WALLET_FILE,
      JSON.stringify(
        {
          balance: 0,              // SKD
          wallet: { ngn: 0, usd: 0 },
          locked: true,             // locked until payment
          lastMined: Date.now()
        },
        null,
        2
      )
    );
  }
  return JSON.parse(fs.readFileSync(WALLET_FILE, "utf-8"));
}

function writeWallet(wallet) {
  fs.writeFileSync(WALLET_FILE, JSON.stringify(wallet, null, 2));
}

// ---------- CONFIG ----------
const SKD_TO_NGN = 3000000; // 1 SKD = ₦3,000,000
const SKD_TO_USD = 2000;
const MIN_WITHDRAW_SKD = 0.01;

// ---------- AUTO-MINING ----------
function updateMining() {
  const wallet = readWallet();
  const now = Date.now();
  const last = wallet.lastMined || now;
  const secondsPassed = Math.floor((now - last) / 1000);

  if (secondsPassed > 0) {
    wallet.balance += secondsPassed * 20;
    wallet.lastMined = now;
    writeWallet(wallet);
  }

  return wallet;
}

// ---------- PAYSTACK VERIFICATION (REAL MONEY ENTRY) ----------
app.post("/verify-payment", async (req, res) => {
  try {
    const { reference } = req.body;

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const data = await response.json();

    if (!data.status || data.data.status !== "success") {
      return res.status(400).json({ success: false });
    }

    const amountNGN = data.data.amount / 100;

    // 🔐 SKYDROP BECOMES REAL HERE
    const wallet = readWallet();
    wallet.wallet.ngn += amountNGN;
    wallet.locked = false; // unlock withdrawals
    writeWallet(wallet);

    res.json({
      success: true,
      message: "Payment verified, wallet funded, withdrawals unlocked",
      amount: amountNGN
    });

  } catch (err) {
    console.error("❌ Verification error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

// ---------- SHARE HELPERS WITH ROUTES ----------
app.locals = {
  readWallet,
  writeWallet,
  updateMining,
  SKD_TO_NGN,
  SKD_TO_USD,
  MIN_WITHDRAW_SKD
};

// ---------- ROUTES ----------
app.use("/wallet", walletRoute);
app.use("/withdraw", withdrawRoute);

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`✅ SkyDrop server running on port ${PORT}`);
});
