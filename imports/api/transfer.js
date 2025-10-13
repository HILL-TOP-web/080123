import { Meteor } from "meteor/meteor";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Your Moniepoint API credentials (replace placeholders)
const MONIEPOINT_API_URL = process.env.MONIEPOINT_API_URL;
const MONIEPOINT_SECRET_KEY = process.env.MONIEPOINT_SECRET_KEY;

Meteor.methods({
  async "wallet.transfer"(userId, amount, currency, accountNumber) {
    try {
      console.log(`💸 Processing transfer for user ${userId}`);

      // Convert SKD to desired currency (USD/NGN)
      let conversionRate = 1;
      if (currency === "USD") conversionRate = 2000; // 1 SKD = $2000
      if (currency === "NGN") conversionRate = 2000 * 1600; // $1 ≈ ₦1600

      const convertedAmount = amount * conversionRate;

      // Send transfer request to Moniepoint API
      const response = await axios.post(
        `${MONIEPOINT_API_URL}/transfer`,
        {
          account_number: accountNumber,
          amount: convertedAmount,
          currency: currency,
          narration: "SkyWallet Transfer"
        },
        {
          headers: {
            Authorization: `Bearer ${MONIEPOINT_SECRET_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("✅ Transfer successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Transfer failed:", error.message);
      throw new Meteor.Error("transfer-failed", error.message);
    }
  }
});
