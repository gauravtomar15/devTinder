const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const userRouter = express.Router();
const User = require("../models/user")
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
});

userRouter.get("/feed", userAuth, async (req,res)=>{
    try {
       const page = parseInt(req.query.page) || 1;
       let limit = parseInt(req.query.limit) || 10;

       limit = limit>50 ? 50 : limit;
       const skip = (page-1)*limit;

       const loggedInUser = req.user;

       const connectionRequest = await ConnectionRequest.find({
        $or: [
            {fromUserId: loggedInUser._id},
            {toUserId: loggedInUser._id}]
       });

       const hideUserFromFeed = new Set();

       connectionRequest.forEach((req)=>{
        hideUserFromFeed.add(req.fromUserId.toString()),
        hideUserFromFeed.add(req.toUserId.toString())
       });

       const users = await User.find({
        $and: [
            { _id: {$nin: Array.from(hideUserFromFeed)}},
            { _id: {$ne: loggedInUser._id}}
        ]
       }).select("firstName lastName ").skip(skip).limit(limit);

     res.send(users);
  
        
    } catch (err) {
        res.send("ERROR :" + err.message);
    }
})

module.exports = userRouter