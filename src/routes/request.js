const express = require("express");
const authRouter = require("./auth");
const { userAuth } = require("../middlewares/auth");
const requestRouter = express.Router();

authRouter.post("/sendConnection", userAuth,  async(req,res)=>{
  try {
    const user = req.user;
    res.send(user.firstName + " sent a connection request")
  } catch (error) {
    res.status(400).send("ERROR: " + error.message)
  }
});

module.exports = requestRouter;