const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");
//Reviews
//post route
router.post("/listings/:id/reviews",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author=req.user._id;
    listing.reviews.push(newReview);
console.log(newReview)
    await newReview.save();
    await listing.save();
    req.flash("success","New Review Created!")
    console.log("new review save")
    res.redirect(`/listings/${listing._id}`);
  })
)
//review 
//post route
router.delete("/listings/:id/reviews/:reviewId",
  isLoggedIn,
  isReviewAuthor,
async (req, res) => {
    let { id, reviewId } = req.params;
    console.log(reviewId)
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted")
    res.redirect(`/listings/${id}`);
  }
)
module.exports=router;