const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Accept comma-separated origins from CLIENT_URL env var, or allow all in dev
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map(o => o.trim())
  : ["http://localhost:3000", "http://localhost:3001"];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ─── BODY PARSING (must come before routes) ───────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── STATIC FILES ─────────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── DB CONNECTION ────────────────────────────────────────────────────────────
connectDB();

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "ok", message: "PropVista API running" }));

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use("/api/auth",       require("./routes/auth"));
app.use("/api/properties", require("./routes/property"));
app.use("/api/users",      require("./routes/user"));
app.use("/api/bookings",   require("./routes/booking"));
app.use("/api/feedback",   require("./routes/feedback"));
app.use("/api/contact",    require("./routes/contact"));
app.use("/api/ai",         require("./routes/ai"));

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[server error]", err.message);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Internal server error" });
});

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
