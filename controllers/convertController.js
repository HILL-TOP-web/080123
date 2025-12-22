import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ---------- PATH SETUP ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WALLET_FILE = path.join(__dirname, "../data/wallet.json");

// ---------- EXCHANGE RATES ----------
const SKD_TO_NGN = 3_000_000; // ₦3,000,000
const SKD_TO_USD = 2_000;     // $2,000

// ---------- WALLET HELPERS ----------
function readWallet() {
  if (!fs.existsSync(WALLET_FILE)) {
    fs.writeFileSync(
      WALLET_FILE,
      JSON.stringify(
        {
          balance: 0,
          wallet: { ngn: 0, usd: 0 },
          locked: 0,
          lastMined: Date.now()
        },
        null,
        2
      )
    );
  }
  return JSON.parse(fs.readFileSync(WALLET_FILE, "utf-8"));
}

function writeWallet(data) {
  fs.writeFileSync(WALLET_FILE, JSON.stringify(data, null, 2));
}

// ---------- CONTROLLER ----------
export function convertSKD(req, res) {
  try {
    const { amount, currency } = req.body;

    // Validation
    if (!amount || amount <= 0)
      return res.status(400).json({ error: "Invalid SKD amount" });

    if (!["NGN", "USD"].includes(currency))
      return res.status(400).json({ error: "Invalid currency" });

    const wallet = readWallet();

    if (amount > wallet.balance)
      return res.status(400).json({ error: "Insufficient SKD balance" });

    // Deduct SKD
    wallet.balance -= amount;

    // Convert
    if (currency === "NGN") {
      wallet.wallet.ngn += amount * SKD_TO_NGN;
    }

    if (currency === "USD") {
      wallet.wallet.usd += amount * SKD_TO_USD;
    }

    writeWallet(wallet);

    return res.json({
      message: "Conversion successful",
      wallet
    });
  } catch (err) {
    console.error("Convert error:", err);
    return res.status(500).json({ error: "Conversion failed" });
  }
      }
