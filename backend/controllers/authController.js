const User = require("../models/User");
const VendorProfile = require("../models/VendorsProfile");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper: generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      storeName,
      description,
      category,
      contact,
      location,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // enforce allowed roles to prevent admin signup via API
    const allowedRoles = ["customer", "vendor"];
    const userRole = allowedRoles.includes(role) ? role : "customer";

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    // If vendor, create vendor profile
    let vendorProfile = null;
    if (userRole === "vendor") {
      vendorProfile = await VendorProfile.create({
        userId: user._id,
        storeName: storeName || name,
        description: description || "",
        category: category || "",
        contact: contact || "",
        location: location || "",
        isApproved: false,
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: userRole === "vendor" ? false : undefined,
        createdAt: user.createdAt,
      },
      vendorProfile: vendorProfile || null,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and explicitly include password (schema has select:false)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Get vendor profile if user is vendor
    let isApproved = undefined;
    if (user.role === "vendor") {
      const vendorProfile = await VendorProfile.findOne({ userId: user._id });
      isApproved = vendorProfile ? vendorProfile.isApproved : false;
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: isApproved,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe };
