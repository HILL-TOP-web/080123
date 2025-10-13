import { Meteor } from "meteor/meteor";
import { Wallets } from "../imports/api/wallets";
import { Mining } from "../imports/api/mining";
import "../imports/api/transfer.js"; // 👈 Added transfer integration

Meteor.methods({
  "mine.start"(userId) {
    console.log(`⛏️ Mining started for user: ${userId}`);
    Mining.insert({
      userId,
      startTime: new Date(),
      active: true
    });
  },

  "mine.stop"(userId) {
    console.log(`🛑 Mining stopped for user: ${userId}`);
    Mining.update({ userId, active: true }, { $set: { active: false } });
  },

  "wallet.credit"(userId, amount) {
    Wallets.update(
      { userId },
      { $inc: { balance: amount } },
      { upsert: true }
    );
  }
});
