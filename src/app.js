const express = require("express");
const app = express();

app.get("/",(req,res)=>{
    res.send("hello from server!");
});
app.get("/test",(req,res)=>{
    res.send("hello from  with test case!");
});
app.get("/hello",(req,res)=>{
    res.send("hello hello hello!");
});


app.listen(7777,()=>{console.log("server is ready")});