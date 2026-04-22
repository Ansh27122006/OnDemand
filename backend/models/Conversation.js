const { Schema, model, models } = require("mongoose");

const conversationSchema = new Schema(
  {
    /**
     * Deterministic room identifier.
     * Generate on the client/service layer by sorting both participant
     * ObjectId strings and joining with an underscore:
     *   const roomId = [userId1, userId2].sort().join('_');
     * This guarantees the same roomId regardless of who initiates the chat.
     */
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    /**
     * Always exactly two participants.
     * Enforced at the application layer before saving; the maxlength
     * validator below adds an extra safety net.
     */
    participants: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      validate: {
        validator: (arr) => arr.length === 2,
        message: "A conversation must have exactly 2 participants.",
      },
    },

    // Short preview shown in the conversation list
    lastMessage: {
      type: String,
      default: "",
      trim: true,
    },

    // Timestamp of the most recent message (used for sorting the inbox)
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    /**
     * Per-user unread counter.
     * Key  : userId.toString()
     * Value: number of unread messages for that user
     *
     * Usage examples:
     *   // Increment receiver's counter when a new message arrives
     *   await Conversation.findByIdAndUpdate(id, {
     *     $inc: { [`unreadCount.${receiverId}`]: 1 },
     *   });
     *
     *   // Reset a user's counter when they open the conversation
     *   await Conversation.findByIdAndUpdate(id, {
     *     $set: { [`unreadCount.${userId}`]: 0 },
     *   });
     */
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
  }
);

// Quickly find all conversations a user belongs to, newest first
conversationSchema.index({ participants: 1, lastMessageAt: -1 });

const Conversation =
  models.Conversation || model("Conversation", conversationSchema);

module.exports = Conversation;
