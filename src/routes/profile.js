const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");


profileRouter.get("/profile", userAuth, async(req,res)=>{

try{
  const user = req.user;
  res.send(user);
  res.send("reading the cookie");
}catch(error){
  res.status(404).send("somethig went wrong");
}
});



module.exports= profileRouter;