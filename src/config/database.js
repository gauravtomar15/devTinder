const mongoose = require("mongoose");

const connectDb = async ()=>{
    await mongoose.connect("mongodb+srv://gaurav_db_user:gaurav%401511@devtinder.yecz2ol.mongodb.net/devTinder"
    )};

module.exports = connectDb;


