import { Meteor } from "meteor/meteor";

// 🧠 In-memory store for mining sessions
const miningSessions = {};

// ⛏️ Core mining functions and methods
Meteor.methods({
  // 🚀 Start mining for a user
  "mine.start"(userId) {
    if (!userId) throw new Meteor.Error("no-user", "User ID is required");

    // Prevent multiple sessions
    if (miningSessions[userId]?.active) {
      throw new Meteor.Error("already-mining", "Mining is already active");
    }

    miningSessions[userId] = {
      userId,
      startTime: new Date(),
      active: true,
      minedAmount: 0
    };

    console.log(`⛏️ Mining started for user: ${userId}`);
    return { status: "started" };
  },

  // 🛑 Stop mining for a user
  "mine.stop"(userId) {
    if (!userId) throw new Meteor.Error("no-user", "User ID is required");

    const session = miningSessions[userId];
    if (!session || !session.active) {
      throw new Meteor.Error("not-mining", "No active mining session found");
    }

    // Calculate mined SKD
    const durationSeconds = (new Date() - session.startTime) / 1000;
    const minedAmount = durationSeconds * 0.01; // e.g., 0.01 SKD per second

    session.active = false;
    session.minedAmount = minedAmount;

    console.log(`🛑 Mining stopped for ${userId}. Total mined: ${minedAmount.toFixed(2)} SKD`);
    return { status: "stopped", minedAmount };
  },

  // 💰 Get mining status
  "mine.status"(userId) {
    const session = miningSessions[userId];
    if (!session) return { active: false, minedAmount: 0 };

    // If still mining, calculate live mined SKD
    let minedAmount = session.minedAmount;
    if (session.active) {
      const durationSeconds = (new Date() - session.startTime) / 1000;
      minedAmount += durationSeconds * 0.01;
    }

    return {
      active: session.active,
      minedAmount: minedAmount.toFixed(2)
    };
  },

  // ♻️ Reset mining data (for testing)
  "mine.reset"(userId) {
    delete miningSessions[userId];
    console.log(`🔄 Mining session reset for ${userId}`);
    return { status: "reset" };
  }
});
