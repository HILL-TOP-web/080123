// controllers/miningController.js
import { readWallet, writeWallet } from "../utils/walletStore.js";

const MINING_RATE = 20; // SKD per second

export function mineSKD(req, res) {
  // Read single global wallet
  const wallet = readWallet();

  const now = Date.now();
  const last = wallet.lastMined || now;
  const secondsPassed = Math.floor((now - last) / 1000);

  if (secondsPassed > 0) {
    wallet.balance += secondsPassed * MINING_RATE;
    wallet.lastMined = now;
    writeWallet(wallet);
  }

  res.json({
    mined: secondsPassed * MINING_RATE,
    balance: wallet.balance
  });
    }
