const express = require("express");
const chatRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { buildChatPayload, ensureChat, createMessage, markMessagesAsRead } = require("../services/chatService");

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;

  try {
    const chat = await ensureChat(userId, targetUserId);
    const payload = await buildChatPayload(chat, userId, targetUserId);
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chat history", details: err.message });
  }
});

chatRouter.post("/chat/:targetUserId/message", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Message text is required" });
  }

  try {
    const result = await createMessage({ userId, targetUserId, text: text.trim() });
    res.status(201).json(result.message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message", details: err.message });
  }
});

chatRouter.post("/chat/:targetUserId/read", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;
  const { messageIds } = req.body || {};

  try {
    const chat = await ensureChat(userId, targetUserId);
    const updatedChat = await markMessagesAsRead(chat, userId, messageIds || []);
    const payload = await buildChatPayload(updatedChat, userId, targetUserId);
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update message status", details: err.message });
  }
});

module.exports = chatRouter;