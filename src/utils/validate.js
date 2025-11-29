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

const validateProfileEditData = (req)=>{
    const allowedData= ["firstName", "lastName","skills","about","password","age" ,"photoUrl"];

    const isAllowedData =  Object.keys(req.body).every((field)=> allowedData.includes(field));

    return isAllowedData;
}

const validatePassword = (req)=>{
    const oldPassword = req.body;
    
}

module.exports = {isValidateData ,validateProfileEditData};