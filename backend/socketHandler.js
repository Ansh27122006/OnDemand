const Message = require("./models/Message");
const Conversation = require("./models/Conversation");

/**
 * Attaches all real-time chat socket events to the Socket.io server instance.
 * Called once from server.js: socketHandler(io)
 */
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    // ── 1. join_room ────────────────────────────────────────────────────────
    /**
     * Client sends: { roomId, userId }
     * Adds the socket to the given room and broadcasts arrival to other members.
     */
    socket.on("join_room", ({ roomId, userId }) => {
      try {
        socket.join(roomId);
        socket.userId = userId; // store for use in disconnect handler

        socket.to(roomId).emit("user_joined", { userId });

        console.log(`[socket] user ${userId} joined room ${roomId}`);
      } catch (error) {
        console.error("[socket] join_room error:", error);
      }
    });

    // ── 2. send_message ─────────────────────────────────────────────────────
    /**
     * Client sends: { roomId, senderId, receiverId, text, conversationId }
     * a. Persists the message to MongoDB.
     * b. Populates senderId.name on the saved document.
     * c. Updates the parent Conversation's preview and unread counter.
     * d. Broadcasts the message to the entire room.
     * e. Notifies both users so their inbox updates in real time.
     */
    socket.on(
      "send_message",
      async ({ roomId, senderId, receiverId, text, conversationId }) => {
        try {
          // ── a. Persist message ──────────────────────────────────────────────
          const newMessage = await Message.create({
            conversationId,
            senderId,
            receiverId,
            text,
          });

          // ── b. Populate sender name ─────────────────────────────────────────
          const populatedMessage = await Message.findById(
            newMessage._id
          ).populate("senderId", "name");

          // ── c. Update Conversation preview + unread counter ─────────────────
          const conversation = await Conversation.findById(conversationId);

          if (conversation) {
            conversation.lastMessage = text;
            conversation.lastMessageAt = new Date();

            // Increment the receiver's unread counter using the Map API
            const currentCount = conversation.unreadCount.get(receiverId) || 0;
            conversation.unreadCount.set(receiverId, currentCount + 1);

            await conversation.save();

            // Re-populate participants so the inbox card renders correctly
            const updatedConversation = await Conversation.findById(
              conversationId
            ).populate("participants", "name email role");

            // ── e. Push inbox update to both users ──────────────────────────
            io.to(roomId).emit("conversation_updated", updatedConversation);
          }

          // ── d. Broadcast message to the room ────────────────────────────────
          io.to(roomId).emit("receive_message", populatedMessage);

          console.log(`[socket] message sent in room ${roomId} by ${senderId}`);
        } catch (error) {
          console.error("[socket] send_message error:", error);
        }
      }
    );

    // ── 3. typing ───────────────────────────────────────────────────────────
    /**
     * Client sends: { roomId, userId, isTyping }
     * Relays the typing state to everyone else in the room (not the sender).
     */
    socket.on("typing", ({ roomId, userId, isTyping }) => {
      try {
        socket.to(roomId).emit("user_typing", { userId, isTyping });
      } catch (error) {
        console.error("[socket] typing error:", error);
      }
    });

    // ── 4. mark_read ────────────────────────────────────────────────────────
    /**
     * Client sends: { roomId, userId }
     * Zeros out the user's unread counter and notifies the room.
     */
    socket.on("mark_read", async ({ roomId, userId }) => {
      try {
        const conversation = await Conversation.findOne({ roomId });

        if (conversation) {
          conversation.unreadCount.set(userId, 0);
          await conversation.save();
        }

        io.to(roomId).emit("messages_read", { roomId, userId });

        console.log(
          `[socket] messages marked read in room ${roomId} by ${userId}`
        );
      } catch (error) {
        console.error("[socket] mark_read error:", error);
      }
    });

    // ── 5. disconnect ───────────────────────────────────────────────────────
    /**
     * Fires automatically when a client loses connection.
     * Broadcasts offline status using the userId stored during join_room.
     */
    socket.on("disconnect", () => {
      console.log(
        `[socket] disconnected: ${socket.id} (userId: ${socket.userId})`
      );

      if (socket.userId) {
        io.emit("user_offline", { userId: socket.userId });
      }
    });
  });
};
