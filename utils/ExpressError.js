class ExpressError extends Error{
  constructor(statesCode,message){
    super();
    this.statesCode=statesCode;
    this.message=message;
  }
}
module.exports=ExpressError;