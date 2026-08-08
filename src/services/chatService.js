const crypto = require("crypto");
const { Chat } = require("../models/chat");

const buildRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const getIdString = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (value._id) return value._id.toString();
  if (value.toHexString) return value.toHexString();
  return value.toString();
};

const ensureChat = async (userId, targetUserId) => {
  let chat = await Chat.findOne({
    participants: { $all: [userId, targetUserId] },
  });

  if (!chat) {
    chat = new Chat({
      participants: [userId, targetUserId],
      messages: [],
      lastMessageAt: new Date(),
    });
    await chat.save();
  }

  return chat;
};

const serializeMessage = (message, currentUserId) => {
  const rawMessage = message.toObject ? message.toObject() : { ...message };
  const senderId = rawMessage.senderId;
  const senderIdString = getIdString(senderId);
  const currentUserIdString = getIdString(currentUserId);

  return {
    ...rawMessage,
    id: rawMessage._id?.toString?.() || rawMessage.id,
    senderId: senderIdString,
    status: rawMessage.status || "sent",
    createdAt: rawMessage.createdAt || null,
    updatedAt: rawMessage.updatedAt || rawMessage.createdAt || null,
    deliveredAt: rawMessage.deliveredAt || null,
    readAt: rawMessage.readAt || null,
    timestamp: rawMessage.createdAt || null,
    isMine: senderIdString === currentUserIdString,
  };
};

const getUnreadCount = (chat, userId) => {
  const currentUserIdString = getIdString(userId);

  return (chat.messages || []).filter((message) => {
    const senderIdString = getIdString(message.senderId);
    return senderIdString !== currentUserIdString && message.status !== "read";
  }).length;
};

const markMessagesAsDelivered = async (chat, recipientUserId) => {
  let changed = false;
  const recipientIdString = getIdString(recipientUserId);

  chat.messages.forEach((message) => {
    const senderIdString = getIdString(message.senderId);
    if (senderIdString && senderIdString !== recipientIdString && message.status === "sent") {
      message.status = "delivered";
      message.deliveredAt = new Date();
      changed = true;
    }
  });

  if (changed) {
    chat.lastMessageAt = chat.lastMessageAt || new Date();
    await chat.save();
  }

  return chat;
};

const markMessagesAsRead = async (chat, userId, messageIds = []) => {
  let changed = false;
  const currentUserIdString = getIdString(userId);

  chat.messages.forEach((message) => {
    const senderIdString = getIdString(message.senderId);
    const isTargetMessage = messageIds.length
      ? messageIds.includes(getIdString(message._id))
      : senderIdString !== currentUserIdString;

    if (isTargetMessage && message.status !== "read") {
      message.status = "read";
      message.readAt = new Date();
      changed = true;
    }
  });

  if (changed) {
    chat.lastMessageAt = chat.lastMessageAt || new Date();
    await chat.save();
  }

  return chat;
};

const buildChatPayload = async (chat, userId, targetUserId) => {
  let normalizedChat = chat;

  if (normalizedChat.messages && normalizedChat.messages.length) {
    normalizedChat = await markMessagesAsDelivered(normalizedChat, userId);
  }

  const messages = (normalizedChat.messages || []).map((message) => serializeMessage(message, userId));

  const User = require("../models/user");
  const targetUser = await User.findById(targetUserId, "firstName lastName photoUrl age gender about skills isPremium");

  return {
    _id: normalizedChat._id,
    participants: normalizedChat.participants,
    messages,
    unreadCount: getUnreadCount(normalizedChat, userId),
    lastMessageAt: normalizedChat.lastMessageAt || normalizedChat.updatedAt || normalizedChat.createdAt,
    roomId: buildRoomId(userId, targetUserId),
    createdAt: normalizedChat.createdAt,
    updatedAt: normalizedChat.updatedAt,
    targetUser,
  };
};

const createMessage = async ({ userId, targetUserId, text }) => {
  const chat = await ensureChat(userId, targetUserId);
  chat.messages.push({
    senderId: userId,
    text,
    status: "sent",
  });
  chat.lastMessageAt = new Date();
  await chat.save();

  const message = chat.messages[chat.messages.length - 1];
  return { chat, message: serializeMessage(message, userId) };
};

module.exports = {
  buildRoomId,
  ensureChat,
  buildChatPayload,
  createMessage,
  getUnreadCount,
  markMessagesAsDelivered,
  markMessagesAsRead,
  serializeMessage,
};
