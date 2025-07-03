const Listing=require("./models/listing")
const Review=require("./models/review")
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");

module.exports.isLoggedIn=(req,res,next)=>{
  console.log(req.originalUrl)
  if(!req.isAuthenticated()){
    req.session.redirectUrl=req.originalUrl;
    console.log(req.session.redirectUrl)
    req.flash("error","Please log in to EasyLiv your House");
    return res.redirect("/login");
  }
  next()
}
module.exports.saveRedirectUrl=(req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  }
  next()
}
module.exports.isOwner=async(req,res,next)=>{
  let {id}=req.params;
  let listing=await Listing.findById(id);
  if(!listing.owner.equals(res.locals.currUser._id)){
    req.flash("error","You are not the owner.Please log in with your Admin Owner ID");
    return res.redirect(`/listings/${id}`)
  }
  next()
}
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  else {
    next();
  }
}
module.exports.isReviewAuthor=async(req,res,next)=>{
  let {id,reviewId}=req.params;
  let review=await Review.findById(reviewId);
  if(!review.author.equals(res.locals.currUser._id)){
    req.flash("error","You are not the author.Please log in with your Admin Owner ID");
    return res.redirect(`/listings/${id}`)
  }
  next()
}