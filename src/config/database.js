const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB);
  } catch (error) {
    console.log("db is not connected");
  }
};

module.exports = connectDb;

