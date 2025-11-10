
const mongoose = require("mongoose");
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
        required: true
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

connectionRequestSchema.pre("save", function (){
    const connectionRequest = this;
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("you can't send request yourself")
    }
    next();
})

const ConnectionRequest = new mongoose.model("connectionRequest",connectionRequestSchema);

module.exports = ConnectionRequest;