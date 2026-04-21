const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Sends a consistent error response and logs the underlying error.
 */
const handleError = (res, error, context = "chatController") => {
  console.error(`[${context}]`, error);
  res.status(500).json({ success: false, message: "Internal server error" });
};

// ─── GET /conversations ──────────────────────────────────────────────────────

/**
 * Returns every conversation the authenticated user participates in,
 * sorted by most-recent message first.
 */
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id, // matches docs where the array contains this id
    })
      .populate("participants", "name email role")
      .sort({ lastMessageAt: -1 });

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    handleError(res, error, "getConversations");
  }
};

// ─── GET /messages/:roomId ───────────────────────────────────────────────────

/**
 * Returns all messages for the conversation identified by roomId,
 * in chronological order (oldest → newest).
 */
const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Resolve the conversation first so we have its _id for the Message query
    const conversation = await Conversation.findOne({ roomId });

    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .populate("senderId", "name")
      .sort({ createdAt: 1 }); // ascending — oldest message at index 0

    res.status(200).json({ success: true, messages });
  } catch (error) {
    handleError(res, error, "getMessages");
  }
};

// ─── POST /conversation ──────────────────────────────────────────────────────

/**
 * Finds an existing 1-to-1 conversation or creates a new one.
 * roomId is deterministic: both participant IDs sorted → joined with '_'.
 * This guarantees idempotency regardless of who initiates the chat.
 */
const getOrCreateConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (!receiverId) {
      return res
        .status(400)
        .json({ success: false, message: "receiverId is required" });
    }

    // Validate receiverId format
    if (typeof receiverId !== "string" || receiverId.length < 10) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid receiverId format" });
    }

    // Validate that the receiver actually exists
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res
        .status(404)
        .json({ success: false, message: "Receiver not found" });
    }

    // Build the deterministic roomId
    const roomId = [req.user._id.toString(), receiverId.toString()]
      .sort()
      .join("_");

    // Try to find an existing conversation first
    let conversation = await Conversation.findOne({ roomId }).populate(
      "participants",
      "name email role"
    );

    if (!conversation) {
      // Create a fresh conversation; unreadCount defaults to an empty Map
      conversation = await Conversation.create({
        roomId,
        participants: [req.user._id, receiverId],
      });

      // Re-query with populate so the response shape is consistent
      conversation = await Conversation.findById(conversation._id).populate(
        "participants",
        "name email role"
      );
    }

    res.status(200).json({ success: true, conversation });
  } catch (error) {
    handleError(res, error, "getOrCreateConversation");
  }
};

// ─── PUT /read/:roomId ───────────────────────────────────────────────────────

/**
 * Marks all unread messages in a conversation as read for the current user:
 *  1. Resets their unreadCount entry on the Conversation document.
 *  2. Flips isRead = true on every Message where they are the receiver.
 */
const markAsRead = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id.toString();

    const conversation = await Conversation.findOne({ roomId });

    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    // ── 1. Zero out this user's unread counter on the Conversation ──────────
    await Conversation.findByIdAndUpdate(conversation._id, {
      $set: { [`unreadCount.${userId}`]: 0 },
    });

    // ── 2. Mark all of this user's unread messages as read ──────────────────
    await Message.updateMany(
      {
        conversationId: conversation._id,
        receiverId: req.user._id,
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    handleError(res, error, "markAsRead");
  }
};

// ────────────────────────────────────────────────────────────────────────────

module.exports = {
  getConversations,
  getMessages,
  getOrCreateConversation,
  markAsRead,
};
