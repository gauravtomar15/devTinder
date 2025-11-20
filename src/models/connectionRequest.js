
const mongoose = require("mongoose");
const user = require("./user")
const connectionRequestSchema = new mongoose.Schema({
    fromName:{
        type: String,
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: user
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ["interested","ignored","accepted","rejected"],
            message: `{VALUE} is not valid status`
        }
    }, 

}, {timestamps: true});

connectionRequestSchema.pre("save", function (next){
    const connectionRequest = this;
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        return next(new Error("you can't send request yourself"));
    }
    next();
})

const ConnectionRequest = new mongoose.model("connectionRequest",connectionRequestSchema);

module.exports = ConnectionRequest;