const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
const validator = require("validator")
const userSchema = mongoose.Schema({
    firstName: {
        type:String,
        required: true,
        minLength: 4,
        maxLength: 16
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: function(value){
            if(!validator.isEmail(value)){
                throw new error("email not valid")
            }
        }

    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    gender:{
        type: String,
        validate: function(value){
            if(!["male","female","others"].includes(value)){
                throw new Error("gender not same")
            }
        }
    },
    age: {
        type: Number,
        min: 18,
    },
    about: {
    type: String,
    default: "Hey there ! I'm Developer"
    },
    skills: {
        type:[String],
    }
    
},{
timestamps: true}
);
userSchema.methods.getJwt= async function (){
      const user = this;
      const token = await jwt.sign({_id: user._id} , "DEV@TINDER$123", {expiresIn: "7d"});
      return token;
};

userSchema.methods.validatePassword = async function(passwordByInput){
    const user = this;
    const passwordHash = user.password;
    const isValidPassword = await bcrypt.compare(passwordByInput, passwordHash);
    return isValidPassword;
}

module.exports = mongoose.model("User" , userSchema);