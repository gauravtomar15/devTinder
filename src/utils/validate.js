const validate = require("validator");

const isValidateData = (req)=>{
    const {firstName , lastName ,password , email} = req.body;
    if(!firstName || !lastName){
        throw new Error("Please enter the Name")
    } else if(!validate.isEmail(email)){
        throw new Error("Please enter valid email")
    } else if(!validate.isStrongPassword(password)){
        throw new Error("Please enter strong password")
    }
}

module.exports = {isValidateData};