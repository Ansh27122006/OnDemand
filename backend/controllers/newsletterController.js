const prisma = require("../config/prismaClient");

/**
 * Subscribe to newsletter (PUBLIC - no auth required)
 * POST /api/newsletter/subscribe
 * Body: { email, name (optional) }
 */
exports.subscribe = async (req, res) => {
  try {
    const { email, name } = req.body;

    // Validate email is provided
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if email already exists
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    // If already subscribed and active, return error
    if (existingSubscriber && existingSubscriber.isActive) {
      return res
        .status(400)
        .json({ message: "You are already subscribed!" });
    }

    // If exists but inactive, reactivate
    if (existingSubscriber && !existingSubscriber.isActive) {
      const updatedSubscriber = await prisma.newsletterSubscriber.update({
        where: { email },
        data: {
          isActive: true,
          name: name || existingSubscriber.name,
        },
      });
      return res.status(200).json({
        message: "Successfully resubscribed! Thank you.",
        subscriber: updatedSubscriber,
      });
    }

    // Create new subscriber
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
        name: name || null,
        isActive: true,
      },
    });

    return res.status(201).json({
      message: "Successfully subscribed! Thank you.",
      subscriber,
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    return res.status(500).json({ error: "Failed to subscribe" });
  }
};

/**
 * Unsubscribe from newsletter (PUBLIC)
 * POST /api/newsletter/unsubscribe
 * Body: { email }
 */
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email is provided
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find subscriber by email
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (!subscriber) {
      return res
        .status(404)
        .json({ message: "Email not found in our subscriber list" });
    }

    // Set isActive = false
    await prisma.newsletterSubscriber.update({
      where: { email },
      data: { isActive: false },
    });

    return res.status(200).json({
      message: "You have been unsubscribed.",
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return res.status(500).json({ error: "Failed to unsubscribe" });
  }
};

/**
 * Get all subscribers (ADMIN ONLY)
 * GET /api/newsletter
 */
exports.getAllSubscribers = async (req, res) => {
  try {
    // Fetch all subscribers ordered by subscribedAt descending
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: {
        subscribedAt: "desc",
      },
    });

    return res.status(200).json({
      subscribers,
      count: subscribers.length,
    });
  } catch (error) {
    console.error("Get all subscribers error:", error);
    return res.status(500).json({ error: "Failed to fetch subscribers" });
  }
};

/**
 * Delete a subscriber (ADMIN ONLY)
 * DELETE /api/newsletter/:id
 * Param: id (subscriber id)
 */
exports.deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate id is provided and is a valid integer
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: "Valid subscriber ID is required" });
    }

    // Delete subscriber
    await prisma.newsletterSubscriber.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      message: "Subscriber deleted successfully",
    });
  } catch (error) {
    console.error("Delete subscriber error:", error);
    if (error.code === "P2025") {
      // Prisma error for record not found
      return res.status(404).json({ error: "Subscriber not found" });
    }
    return res.status(500).json({ error: "Failed to delete subscriber" });
  }
};
