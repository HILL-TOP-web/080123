// ================================
// 🚀 Mine App - Meteor Server Entry
// Author: Daniel David Oluwayimika
// ================================

// Import Meteor core packages
import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import dotenv from "dotenv";
import os from "os";

// Import app methods (like transfer, mining, wallet, etc.)
import "./methods.js";

// Load environment variables
dotenv.config();

// Meteor startup
Meteor.startup(() => {
  // Detect and display container ID
  const containerName = process.env.HOSTNAME || os.hostname();
  console.log(`🚀 Mine App Server started successfully!`);
  console.log(`🧱 Running inside container: ${containerName}`);
});

// WebApp handler — root route
WebApp.connectHandlers.use("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("🚀 Mine SKD App is Live ✅");
});
