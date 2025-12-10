export const stats = (req, res) => {
  res.json({
    totalUsers: 128,
    totalSKDmined: 281920,
    systemStatus: "OPERATIONAL"
  });
};
