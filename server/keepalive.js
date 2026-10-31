// keepalive.js — pings the server every 14 minutes to prevent Render free tier cold starts
// Called automatically when the server starts

const https = require("https");

const SERVER_URL = process.env.SERVER_URL || "https://propvista-ai-powered-real-estate.onrender.com";

function ping() {
  https.get(`${SERVER_URL}/`, (res) => {
    console.log(`[keepalive] Pinged ${SERVER_URL} — status: ${res.statusCode}`);
  }).on("error", (err) => {
    console.log(`[keepalive] Ping failed: ${err.message}`);
  });
}

// Ping every 14 minutes (Render sleeps after 15 min of inactivity)
const INTERVAL = 14 * 60 * 1000; // 14 minutes

module.exports = function startKeepalive() {
  // Wait 30s after server start before first ping
  setTimeout(() => {
    ping();
    setInterval(ping, INTERVAL);
    console.log(`[keepalive] Started — pinging every 14 minutes`);
  }, 30000);
};
