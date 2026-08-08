const socket = require("socket.io");
const { createMessage, buildRoomId, markMessagesAsDelivered, markMessagesAsRead, getUnreadCount } = require("../services/chatService");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: ["http://localhost:5173",
        "https://gauravdevconnect.netlify.app"
      ],
      credentials: true,
    },
  });

  const onlineUsers = new Map();

  const emitPresence = (socketId, userId) => {
    const userPayload = {
      userId,
      online: true,
      lastSeen: null,
    };

    io.emit("presence:update", userPayload);
  };

  io.on("connection", (socket) => {
    socket.on("authenticate", ({ userId }) => {
      if (!userId) return;
      onlineUsers.set(socket.id, userId);
      socket.join(userId.toString());
      emitPresence(socket.id, userId);
      
      const onlineUserIds = Array.from(new Set(onlineUsers.values()));
      socket.emit("presence:initial", onlineUserIds);
    });

    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = buildRoomId(userId, targetUserId);
      socket.join(roomId);
      socket.emit("chat:joined", { roomId });
    });

    socket.on("typing", ({ userId, targetUserId, isTyping }) => {
      const roomId = buildRoomId(userId, targetUserId);
      socket.to(roomId).emit("typing:update", { userId, isTyping });
    });

    socket.on("sendMessage", async ({ userId, targetUserId, text, firstName }) => {
      try {
        const { chat, message } = await createMessage({ userId, targetUserId, text });
        const roomId = buildRoomId(userId, targetUserId);
        const payload = {
          ...message,
          firstName,
          roomId,
        };

        io.to(roomId).emit("receiveMessage", payload);
        io.to(targetUserId.toString()).emit("notification:newMessage", {
          from: userId,
          text,
          roomId,
          unreadCount: getUnreadCount(chat, targetUserId),
          timestamp: message.timestamp || message.createdAt,
        });

        await markMessagesAsDelivered(chat, targetUserId);
        io.to(roomId).emit("message:status", { userId: targetUserId, status: "delivered" });
      } catch (err) {
        socket.emit("chat:error", { error: "Failed to send message", details: err.message });
      }
    });

    socket.on("markMessagesAsRead", async ({ userId, targetUserId, messageIds }) => {
      try {
        const chat = await require("../models/chat").Chat.findOne({ participants: { $all: [userId, targetUserId] } });
        if (!chat) return;
        const updatedChat = await require("../services/chatService").markMessagesAsRead(chat, userId, messageIds || []);
        const roomId = buildRoomId(userId, targetUserId);
        io.to(roomId).emit("message:status", { userId, status: "read", messageIds });
        io.to(targetUserId.toString()).emit("notification:read", {
          from: userId,
          unreadCount: getUnreadCount(updatedChat, targetUserId),
        });
      } catch (err) {
        socket.emit("chat:error", { error: "Failed to update read status", details: err.message });
      }
    });

    socket.on("disconnect", () => {
      const userId = onlineUsers.get(socket.id);
      if (userId) {
        onlineUsers.delete(socket.id);
        io.emit("presence:update", {
          userId,
          online: false,
          lastSeen: new Date().toISOString(),
        });
      }
    });
  });
};

module.exports = initializeSocket;
