const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const userRouter = express.Router();

userRouter.get("/user/request/received", userAuth, async (req ,res)=>{
  try {
   const loggedIn = req.user;
   const connectionRequest = await ConnectionRequest.find({
    toUserId: loggedIn,
    status: "interested"
   }).populate("fromUserId" ,["firstName", "lastName"]);

   if(!connectionRequest){
    return res.send("No request available")
   }
   res.json({
    message: "all requets",
    data: connectionRequest
   })

    
  } catch (err) {
    res.status(400).send("ERROR :"+ err.message)
    
  }
});

userRouter.get("/user/connections", userAuth, async (req, res)=>{
    try {
        const loggedIn = req.user;

        const connectionRequest = await ConnectionRequest.find({
            $or: [
                { toUserId: loggedIn._id , status: "accepted"},

                {fromUserId: loggedIn._id , status: "accepted"}
            ]
        }).populate("fromUserId" , ["firstName","lastName"])
        const data = connectionRequest.map((row)=> row.fromUserId)
        res.json({data})


    } catch (err) {
        res.status(400).send(err.message)
    }
})

module.exports = userRouter