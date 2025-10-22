// ================================
//  Mine App - Meteor Server Entry
//  Author: Daniel David Oluwayimika
// ================================

// Import Meteor core modules
import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import dotenv from "dotenv";

// Load environment variables from .env file (if any)
dotenv.config();

// ===================================
// Startup
// ===================================
Meteor.startup(() => {
  console.log("🚀 Mine App Server started successfully!");
  console.log("✅ Environment variables loaded.");
});

// ===================================
// Simple API route
// ===================================
WebApp.connectHandlers.use("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("🚀 Mine SKD App is Live ✅");
});

// ===================================
// Example route for health check (optional)
// ===================================
WebApp.connectHandlers.use("/health", (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "healthy", uptime: process.uptime() }));
});
