const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorHandler");
const uploadRoutes = require("./routes/uploadRoutes");

//const { autoReleaseEscrow } = require("./jobs/autoConfirmDelivery");
//setInterval(autoReleaseEscrow, 60 * 60 * 1000); // every hour
const cron = require("node-cron");
const autoConfirmDelivery = require("./cron/autoConfirmDelivery");

// Runs every 30 minutes (recommended)
cron.schedule("0 */30 * * * * ", async () => {
  console.log("⏰ Running auto-confirm delivery job");
  await autoConfirmDelivery();
});

const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const proposalRoutes = require("./routes/proposalRoutes");
const contractRoutes = require("./routes/contractRoutes");
const escrowRoutes = require("./routes/escrowRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const configRoutes = require("./routes/configRoutes");

const app = express();
connectDB();

/* =======================
   🔥 CORS — MUST BE FIRST
   ======================= */
const CLIENT_URL = process.env.VITE_CLIENT_URL;

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ VERY IMPORTANT — allow preflight

/* =======================
   MIDDLEWARES
   ======================= */
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Connect route
app.use("/api", uploadRoutes);

/* =======================
   ROUTES
   ======================= */
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/escrow", escrowRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/config", configRoutes);


app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Welcome To AgriAssure",
  });
});
/* =======================
   ERROR HANDLER
   ======================= */
app.use(errorHandler);

/* =======================
   SERVER
   ======================= */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
