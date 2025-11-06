const express = require("express");
const connectDb = require("./config/database");
const User = require("./models/user");
const { isValidateData } = require("./utils/validate");
const app = express();
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");


app.use(express.json());
app.use(cookieParser());

// create the data

app.post("/signUp", async (req, res) => {
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

app.post("/login", async (req,res)=>{
  try {
    const {email,password} = req.body;
    const user = await User.findOne({email: email});
    if(!user){
      throw new Error("Invalid Credentials")
    }
    const isValidPassword = await bcrypt.compare(password, user.password )
    if(isValidPassword){
      const token = await user.getJwt();
      res.cookie("token",token);
       res.send("login successfully!!!");
    }
    else{
      throw new Error("Invalid Credentials")
     
    }
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});

app.get("/profile", userAuth, async(req,res)=>{

try{
  const user = req.user;
  res.send(user);
  res.send("reading the cookie");
}catch(error){
  res.status(404).send("somethig went wrong");
}
});

app.post("/sendConnection", userAuth,  async(req,res)=>{
  try {
    const user = req.user;
    res.send(user.firstName + " sent a connection request")
  } catch (error) {
    res.status(400).send("ERROR: " + error.message)
  }
});

connectDb()
  .then(() => {
    console.log("db is connected");
    app.listen(7777, () => {
      console.log("server is ready");
    });
  })
  .catch((err) => {
    console.error("db is not connected");
  });
