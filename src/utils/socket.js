const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");

const initializeSocket = (server) => {

  const getSecretRoomId = (userId, targetUserId)=>{
      return crypto.createHash("sha256").update([userId , targetUserId].sort().join("_")).digest("hex");

  }
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({firstName ,userId, targetUserId}) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " " + "roomId :", roomId);
      socket.join(roomId);

    });
    socket.on("sendMessage", async ({firstName , userId, targetUserId, text}) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " " + text);

      try {
        let chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

         if(!chat){
          chat = new Chat({
            participants: [userId, targetUserId],
            messages: [],
          });
         }

         chat.messages.push({
          senderId: userId,
          text,
         });
         await chat.save();
        
      } catch (err) {
        console.log("Error saving message: ", err);
      }

      io.to(roomId).emit("receiveMessage", {firstName,  text});
    });
   
    socket.on("disconnect", () => {

    });
  });
};

module.exports = initializeSocket;
