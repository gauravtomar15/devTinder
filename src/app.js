const express = require("express");
const connectDb = require("./config/database");
const User = require("./models/user")
const app = express();

app.post("/signUp", async(req , res)=>{
    
    const user = new User({
        firstName: "Gaurav",
        lastName: "Tomar",
        email:"Gaurav@tomar.com",
        password: "21",
    }) ;
   try {
     await user.save();
     res.send("user data updated sucessfully");
   } catch (err) {
     res.status(400).send("user fill wrong")
   }
   console.log("added the data")
})


connectDb().then(()=>{
    console.log("db is connected");
    app.listen(7777,()=>{console.log("server is ready")});
}).catch((err)=>{
    console.error("db is not connected")
});

