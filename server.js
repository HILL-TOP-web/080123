// ---------- LOAD ENV ----------
import 'dotenv/config'; // loads variables from .env automatically

import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Routes
import walletRoute from "./routes/walletRoute.js";
import withdrawRoute from "./routes/withdrawRoute.js";

// ---------- SETUP ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- MIDDLEWARE ----------
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---------- FILE PATH ----------
const WALLET_FILE = path.join(__dirname, "wallet.json");

// ---------- HELPERS ----------
function readWallet() {
  if (!fs.existsSync(WALLET_FILE)) {
    fs.writeFileSync(
      WALLET_FILE,
      JSON.stringify({
        balance: 0,
        wallet: { ngn: 0, usd: 0 },
        locked: 0,
        lastMined: Date.now()
      }, null, 2)
    );
  }
  return JSON.parse(fs.readFileSync(WALLET_FILE, "utf-8"));
}

function writeWallet(wallet) {
  fs.writeFileSync(WALLET_FILE, JSON.stringify(wallet, null, 2));
}

// ---------- CONFIG ----------
const SKD_TO_NGN = 3000000; // 1 SKD = ₦3,000,000
const SKD_TO_USD = 2000;    // 1 SKD = $2,000
const MIN_WITHDRAW_SKD = 0.01; // corresponds to ₦30,000

// ---------- AUTO-MINE FUNCTION ----------
function updateMining() {
  const wallet = readWallet();
  const now = Date.now();
  const last = wallet.lastMined || now;
  const secondsPassed = Math.floor((now - last) / 1000);

  if (secondsPassed > 0) {
    wallet.balance += secondsPassed * 20; // 20 SKD per second
    wallet.lastMined = now;
    writeWallet(wallet);
  }

  return wallet;
}

// ---------- PASS HELPERS & CONFIG TO ROUTES ----------
app.locals = {
  readWallet,
  writeWallet,
  updateMining,
  SKD_TO_NGN,
  SKD_TO_USD,
  MIN_WITHDRAW_SKD,
  PAYMENT_SECRET_KEY: process.env.PAYMENT_SECRET_KEY // now accessible in controllers
};

// ---------- ROUTES ----------
app.use("/wallet", walletRoute);       // Mining, convert, wallet status
app.use("/withdraw", withdrawRoute);   // Real-money withdrawals

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
