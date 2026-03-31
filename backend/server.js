const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
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


// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vendors", vendorRoutes); // plural to match frontend & spec
app.use("/api/products", productRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wishlist", wishlistRoutes);

// Start server
const PORT = process.env.PORT || 5000;
// Global error handler
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
