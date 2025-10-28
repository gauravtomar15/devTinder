const express = require("express");
const connectDb = require("./config/database");
const User = require("./models/user")
const app = express();


app.use(express.json());

// create the data

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

// read the data

app.get("/user", async (req,res)=>{
     const userId = req.body._id;
 try {
   console.log(userId);
   const user = await User.findById({_id: userId});
   if(!user){
    res.send("user not found");
   } else{
   res.send(user);
   }
 } catch (error) {
    res.status(404).send("somethig went wrong")
 }
});


//delete the data

app.delete("/user", async (req,res)=>{
   const userId = req.body._id;
   try{
    console.log(userId);
    const user = await User.findOneAndDelete(userId)
    
    res.send("user is deleted sucessfully");
   }
   catch (error) {
   res.status(404).send("somethig went wrong")
 }

});


// update the data

app.patch("/user", async(req,res)=>{
  const userId = req.body._id;
  const Data = req.body;
  try{
   const user = await User.findByIdAndUpdate(userId, Data,{returnDocument: "after"});
   console.log(user);
   res.send("user updated sucessfully")
  }
   catch (error) {
   res.status(404).send("somethig went wrong")
 }
});


connectDb()
.then(()=>{
    console.log("db is connected");
    app.listen(7777,()=>{console.log("server is ready")});
  })
.catch((err)=>{
    console.error("db is not connected")
});

