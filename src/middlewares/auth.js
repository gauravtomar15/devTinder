const adminAuth = (req,res,next)=>{
  const token = "xyz";
  const isAuthorized= token === "xyz";
  if(isAuthorized){
    next();
  }
  else{
    res.status(401).send("unauthorized the admin")
  }
};
const userAuth = (req,res,next)=>{
  const token = "xyz";
  const isAuthorized= token === "yz";
  if(isAuthorized){
    next();
  }
  else{
    res.status(401).send("unauthorized the admin")
  }
};
module.exports = {adminAuth,userAuth};