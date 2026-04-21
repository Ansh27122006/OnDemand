const { Schema, model, models } = require("mongoose");

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
  }
);

// Compound index: fetch all messages in a conversation sorted by time
messageSchema.index({ conversationId: 1, createdAt: 1 });

// Quick lookup of unread messages per recipient inside a conversation
messageSchema.index({ conversationId: 1, receiverId: 1, isRead: 1 });

const Message = models.Message || model("Message", messageSchema);

module.exports = Message;
