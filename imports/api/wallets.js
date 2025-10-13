import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

// 💰 Create a MongoDB collection for storing user wallets
export const Wallets = new Mongo.Collection("wallets");

// 🧠 Optional: Secure access rules (only server methods can write)
if (Meteor.isServer) {
  Meteor.publish("wallets", function () {
    return Wallets.find({ userId: this.userId });
  });
}

// ⚙️ Optional helper functions for managing wallet balances
Meteor.methods({
  // ✅ Create a wallet when a new user starts mining
  "wallet.create"(userId) {
    const existing = Wallets.findOne({ userId });
    if (!existing) {
      Wallets.insert({
        userId,
        balance: 0,
        createdAt: new Date()
      });
      console.log(`🆕 Wallet created for user: ${userId}`);
    }
  },

  // 💵 Credit wallet (e.g., after mining)
  "wallet.credit"(userId, amount) {
    Wallets.update(
      { userId },
      { $inc: { balance: amount } },
      { upsert: true }
    );
    console.log(`💰 Wallet credited: ${amount} SKD for ${userId}`);
  },

  // 💸 Debit wallet (e.g., after transfer)
  "wallet.debit"(userId, amount) {
    const wallet = Wallets.findOne({ userId });
    if (!wallet || wallet.balance < amount) {
      throw new Meteor.Error("insufficient-funds", "Not enough SKD balance");
    }
    Wallets.update({ userId }, { $inc: { balance: -amount } });
    console.log(`💸 Wallet debited: ${amount} SKD for ${userId}`);
  },

  // 📊 Check wallet balance
  "wallet.balance"(userId) {
    const wallet = Wallets.findOne({ userId });
    return wallet ? wallet.balance : 0;
  }
});
