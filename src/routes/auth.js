const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const { isValidateData } = require("../utils/validate");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

authRouter.post("/signUp", async (req, res) => {
  try {
    //validate
    isValidateData(req);
    //bcrypt password
    const { firstName, lastName, email, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);
    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });
    await user.save();
    res.send("user added data successfully");
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
  console.log("added the data");
});


authRouter.post("/login", async (req, res)=>{
  try {
    const {email,password} = req.body;
    const user = await User.findOne({email: email});
    if(!user){
       throw new Error("Invalid Credentials");    
    }
    const isValidPassword = await user.validatePassword(password);
    if(isValidPassword){
      const token = await user.getJwt();
      res.cookie("token",token);
      res.send(user);
    }
    else{
      throw new Error("Invalid Credentials");    
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/logout" , async(req, res)=>{
  res.cookie("token", null, {
    expires: new Date(Date.now())});
  res.send("logout succesfull");
})

module.exports = authRouter;