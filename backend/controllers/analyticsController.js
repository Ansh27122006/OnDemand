const prisma = require("../config/prismaClient");
const Order = require("../models/Order");
const User = require("../models/User");
const VendorProfile = require("../models/VendorsProfile");
const Booking = require("../models/Bookings");

// @desc    Save today's daily snapshot to PostgreSQL
// @route   POST /api/analytics/snapshot
// @access  Admin
const saveDailySnapshot = async (req, res) => {
  try {
    // Get start and end of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Fetch stats from MongoDB
    const totalOrders = await Order.countDocuments();
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    });
    const newVendors = await VendorProfile.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    });
    const totalBookings = await Booking.countDocuments();

    // Calculate total revenue from all orders
    const revenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if today's snapshot already exists
    const existingSnapshot = await prisma.dailyAnalytics.findUnique({
      where: {
        date: today,
      },
    });

    let snapshot;

    if (existingSnapshot) {
      // Update existing snapshot
      snapshot = await prisma.dailyAnalytics.update({
        where: { date: today },
        data: {
          totalOrders,
          totalRevenue,
          newUsers,
          newVendors,
          totalBookings,
        },
      });
    } else {
      // Create new snapshot
      snapshot = await prisma.dailyAnalytics.create({
        data: {
          date: today,
          totalOrders,
          totalRevenue,
          newUsers,
          newVendors,
          totalBookings,
        },
      });
    }

    res.status(201).json({
      message: "Daily snapshot saved successfully",
      snapshot,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get all analytics data from PostgreSQL
// @route   GET /api/analytics
// @access  Admin
const getAnalytics = async (req, res) => {
  try {
    const analytics = await prisma.dailyAnalytics.findMany({
      orderBy: {
        date: "desc",
      },
    });

    res.status(200).json({
      count: analytics.length,
      analytics,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  saveDailySnapshot,
  getAnalytics,
};
