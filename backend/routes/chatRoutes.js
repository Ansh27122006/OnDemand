const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getConversations,
  getMessages,
  getOrCreateConversation,
  markAsRead,
} = require("../controllers/chatController");

// All chat routes require a valid JWT — no role restriction beyond authentication.
// The protect middleware should attach the decoded user to req.user.

// GET  /api/chat/conversations       – list all conversations for the current user
router.get("/conversations", protect, getConversations);

// GET  /api/chat/messages/:roomId    – fetch messages for a specific room
router.get("/messages/:roomId", protect, getMessages);

// POST /api/chat/conversation        – get or create a 1-to-1 conversation
router.post("/conversation", protect, getOrCreateConversation);

// PUT  /api/chat/read/:roomId        – mark all messages in a room as read
router.put("/read/:roomId", protect, markAsRead);

module.exports = router;
