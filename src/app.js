const express = require("express");
const app = express();

const {adminAuth,userAuth} = require("./middlewares/auth")

app.use("/admin",adminAuth);

app.get("/admin/getAllData",(req,res)=>{
    console.log("data send");
    res.send("send the data");
});

app.get("/admin/deleteAllData",(req,res)=>{
    console.log("data send");
    res.send("delete the data");
});


app.get("/user", userAuth,(req,res)=>{
    console.log("data send");
    res.send("send the data from user")
});
app.get("/user/update", userAuth,(req,res)=>{
    console.log("data send");
    res.send("update the from user")
});




app.listen(7777,()=>{console.log("server is ready")});