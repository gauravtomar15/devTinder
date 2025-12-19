const cron = require("node-cron");
const ConnectionRequest = require("../models/connectionRequest");
const { subDays, startOfDay, endOfDay } = require("date-fns")
const sendEmail = require("./sendEmail")

cron.schedule(" 16 23 * * * ", async ()=>{
  try {
     const yesterday = subDays(new Date(), 0);
     const yesterdayStart = startOfDay(yesterday);
     const yesterdayEnd = endOfDay(yesterday); 

        const pendingRequest = await ConnectionRequest.find({
        status: "interested",
        createdAt: {
            $gte: yesterdayStart ,
            $lt: yesterdayEnd
        }
    }).populate("fromUserId toUserId")

    const listOfEmail = [...new Set(pendingRequest.map((req)=>req.toUserId.email))];

    console.log(listOfEmail)

    for(const email of listOfEmail){
        try {
            const res = await sendEmail.run("A New Request"+ email, "please accept or reject")
            console.log(res)
        } catch (err) {
            console.log(err)
        }
    }
    
  } catch (err) {
    console.log(err)
  }
})