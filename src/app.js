const dotenv = require("dotenv");
dotenv.config({ path: ".env" });


const express = require("express");
const connectDb = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");

require("./utils/cronjob");


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
const payment = require("./routes/payment");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");


app.use("/",auth);
app.use("/", profile)
app.use("/", request)
app.use("/",user)
app.use("/",payment)
app.use("/", chatRouter)
const server = http.createServer(app);

initializeSocket(server);
console.log("db before")

connectDb()
 .then(() => {
    console.log("db is connected");
    server.listen(7777, () => {
      console.log("server is ready");
    });
  })
  .catch((err) => {
    console.error("db is not connected");
  });
