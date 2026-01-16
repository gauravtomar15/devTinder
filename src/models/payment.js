const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    paymentId: {
       type: String
    },
    orderId: {
        type: String
    },
    amount: {
        type: String
    },
    currency:{
        type: String
    },
    status: {
        type: String
    },
    notes: {
        firstName: {
            type: String
        },
        lastName: {
            type: String
        }
    }

},{timestamps: true});

module.exports =  mongoose.model("Payment", paymentSchema);