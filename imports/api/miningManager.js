const activeMiners = new Set();

export function startMining(userId) {
  if (!activeMiners.has(userId)) {
    activeMiners.add(userId);
    console.log(`⛏️ Mining started for ${userId}`);
  }
}

export function stopMining(userId) {
  if (activeMiners.has(userId)) {
    activeMiners.delete(userId);
    console.log(`🛑 Mining stopped for ${userId}`);
  }
}
