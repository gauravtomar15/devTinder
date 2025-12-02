const express = require("express");
const connectDb = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");


app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

const auth = require("./routes/auth");
const profile = require("./routes/profile");
const request = require("./routes/request");
const user = require("./routes/user")

app.use("/",auth);
app.use("/", profile)
app.use("/", request)
app.use("/",user)


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
