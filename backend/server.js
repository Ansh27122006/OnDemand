const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
// Load environment variables
dotenv.config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const productRoutes = require("./routes/productRoutes.js");
const serviceRoutes = require("./routes/serviceRoutes.js");
const cartRoutes = require("./routes/cartRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const bookingRoutes = require("./routes/bookingRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const wishlistRoutes = require("./routes/wishlistRoutes.js");
const couponRoutes = require("./routes/couponRoutes.js");
const reviewRoutes = require("./routes/reviewRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const returnRoutes = require("./routes/ReturnRoutes.js");
const analyticsRoutes = require("./routes/analyticsRoutes.js");
const newsletterRoutes = require("./routes/newsletterRoutes.js");
const auditRoutes = require("./routes/auditRoutes");
// ── Socket.io setup ────────────────────────────────────────────────────────
const http = require("http");
const { Server } = require("socket.io");
const socketHandler = require("./socketHandler");
// ──────────────────────────────────────────────────────────────────────────

// Connect to MongoDB
connectDB();

const app = express();

// ── Create HTTP server and attach Socket.io ────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:
      process.env.FRONTEND_URL ||
      "http://localhost:5173" ||
      "https://ondemand.vercel.app",
    methods: ["GET", "POST"],
  },
});

socketHandler(io);
// ──────────────────────────────────────────────────────────────────────────

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Landing page server-side rendered view
const landingStats = [
  { value: "2,400+", label: "Active Vendors" },
  { value: "18,000+", label: "Products Listed" },
  { value: "95%", label: "Satisfaction Rate" },
  { value: "40+", label: "Categories" },
];

const landingFeatures = [
  {
    icon: "shopping-bag",
    title: "Buy Products",
    description:
      "Discover thousands of products from verified vendors. Filter by category, price, and ratings to find exactly what you need — delivered to your door.",
    accent: "bg-blue-50 text-blue-600",
    border: "hover:border-blue-200",
  },
  {
    icon: "calendar",
    title: "Book Services",
    description:
      "From home repairs to professional consulting — browse service providers, check availability, and book appointments in just a few clicks.",
    accent: "bg-indigo-50 text-indigo-600",
    border: "hover:border-indigo-200",
  },
  {
    icon: "shield-check",
    title: "Trusted Vendors",
    description:
      "Every vendor is manually reviewed and approved by our team. Real reviews, verified credentials, and a transparent rating system you can rely on.",
    accent: "bg-sky-50 text-sky-600",
    border: "hover:border-sky-200",
  },
];

app.get("/", (req, res) => {
  res.render("landing", {
    stats: landingStats,
    features: landingFeatures,
    year: new Date().getFullYear(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/products", productRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/audit", auditRoutes);

if (process.env.NODE_ENV === "production") {
  const frontendBuildPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendBuildPath));

  app.get("*", (req, res, next) => {
    if (
      req.originalUrl.startsWith("/api") ||
      req.originalUrl.startsWith("/api-docs")
    ) {
      return next();
    }
    res.sendFile(path.join(frontendBuildPath, "index.html"));
  });
}

// Global error handler
const PORT = process.env.PORT || 5000;

app.use((err, req, res, next) => {
  console.error("Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server only when this file is run directly
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
