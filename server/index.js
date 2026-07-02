const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ ADD ONLY THIS LINE
app.use("/uploads", express.static("uploads"));

connectDB(); // ✅ Connect DB FIRST

app.get("/", (req, res) => {
  res.send("Server working");
});

// 🤖 AI routes
app.use("/api/ai", require("./routes/ai"));

// 🔐 Auth routes
app.use("/api/auth", require("./routes/auth"));

// 🏠 Property routes
app.use("/api/properties", require("./routes/property"));
app.use("/api/users", require("./routes/user"));
app.use("/api/bookings", require("./routes/booking"));
app.use("/api/feedback", require("./routes/feedback"));
app.use("/api/contact", require("./routes/contact"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
