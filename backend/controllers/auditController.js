const prisma = require("../config/prismaClient");

// @desc    Helper function to create audit log entries
// @access  Internal (called from other controllers)
// @note    Fire-and-forget: does NOT throw errors, only console.error on failure
const createAuditLog = async (
  { adminId, adminName, action, targetId, targetName, details } = {}
) => {
  try {
    // Validate required fields
    if (!adminId || !adminName || !action || !targetId || !targetName) {
      console.error("createAuditLog: Missing required fields", {
        adminId,
        adminName,
        action,
        targetId,
        targetName,
      });
      return;
    }

    await prisma.auditLog.create({
      data: {
        adminId,
        adminName,
        action,
        targetId,
        targetName,
        details: details || null,
      },
    });
  } catch (error) {
    console.error("createAuditLog Error:", error.message);
    // Do NOT throw — audit log failure should never crash the main operation
  }
};

// @desc    Get all audit logs (with optional action filter)
// @route   GET /api/audit
// @route   GET /api/audit?action=APPROVE_VENDOR
// @access  Admin
const getAuditLogs = async (req, res) => {
  try {
    const { action } = req.query;

    // Build filter
    const where = action ? { action } : {};

    // Fetch all audit logs, ordered by createdAt descending (newest first)
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      count: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createAuditLog,
  getAuditLogs,
};
