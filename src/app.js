const express = require("express");
const connectDb = require("./config/database");
const User = require("./models/user")
const app = express();


app.use(express.json());

app.post("/signUp", async(req , res)=>{
    
    const user = new User(req.body) ;
   try {
     await user.save();
     res.send("user added data successfully")
     
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

