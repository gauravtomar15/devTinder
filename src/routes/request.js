const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const mongoose = require("mongoose");

const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail")


requestRouter.post("/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;
    const fromName = req.user.firstName;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).send("Invalid user ID format");
    }

    const statusAllowed = ["interested", "ignored"];
    if (!statusAllowed.includes(status)) {
      return res.status(400).send("status is not valid: " + status);
    }

    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });
    if (existingConnectionRequest) {
      return res.status(400).send("connection request already exist");
    }

    const toUser = await User.findById(toUserId);
    if (!toUser) return res.status(404).send("user not found");

    const connectionRequest = new ConnectionRequest({
      toUserId,
      fromUserId,
      status,
      fromName,
    });
   
    const data = await connectionRequest.save();
    const email = await sendEmail.run("A New Friend request from " + req.user.firstName ,`${req.user.firstName} is ${status} in ${toUser.firstName}`,);

    res.json({
      message: `${req.user.firstName} is ${status} in ${toUser.firstName}`,
      data,
    });

  } catch (error) {
   
    res.status(400).send("ERROR : " + error.message);
  }
});

requestRouter.post(
  "/request/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedIn = req.user;
      const { status, requestId } = req.params;
      const allowedStatus = ["accepted", "rejected"];

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return res.status(400).send("Invalid request ID format");
      }

      if (!allowedStatus.includes(status)) {
        return res.status(400).send("status not valid");
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedIn._id,
        status:"interested",
      });

      if (!connectionRequest) {
        return res.status(404).json({ message: "connection request not found" });
      }

      connectionRequest.status = status;
      await connectionRequest.save();

      res.json({
        message: `connection request ${status}`,
        data: connectionRequest,
      });
    } catch (err) {
      res.status(404).send("ERROR__: " + err.message);
    }
  }
);

module.exports = requestRouter;
