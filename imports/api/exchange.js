// 💷 Exchange module for £ → ₦ conversion
export const EXCHANGE_RATE = 1850; // 1 GBP = 1850 NGN

export function convertToNaira(amountGBP) {
  return amountGBP * EXCHANGE_RATE;
}

export function convertToGBP(amountNGN) {
  return amountNGN / EXCHANGE_RATE;
}
