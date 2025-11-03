import { convertToNaira } from "./exchange.js";

const wallets = {}; // In-memory wallet storage

export function creditWallet(userId, amountGBP) {
  if (!wallets[userId]) {
    wallets[userId] = { balanceGBP: 0, balanceNGN: 0 };
  }

  const amountNGN = convertToNaira(amountGBP);
  wallets[userId].balanceGBP += amountGBP;
  wallets[userId].balanceNGN += amountNGN;

  console.log(`💰 Wallet updated for ${userId}: £${wallets[userId].balanceGBP} / ₦${wallets[userId].balanceNGN}`);

  return wallets[userId];
}

export function getWallet(userId) {
  return wallets[userId] || { balanceGBP: 0, balanceNGN: 0 };
    }
