const express = require("express");
const app = express();

app.get("/ab",(req,res)=>{
    console.log(req.params);
    res.send({first: "gaurav", last: "tomar"});
});

app.get("/ab/c",(req,res)=>{
    console.log(req.params);
    res.send({first: "gaurav", last: "tomar", age: "21"});
});


app.listen(7777,()=>{console.log("server is ready")});