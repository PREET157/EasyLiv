const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
// const ExpressError = require("../utils/ExpressError.js");
// const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const flash = require("connect-flash");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const User=require("../models/user.js");

// const validateListing = (req, res, next) => {
//   let { error } = listingSchema.validate(req.body);
//   if (error) {
//     let errMsg = error.details.map((el) => el.message).join(",");
//     throw new ExpressError(400, errMsg);
//   }
//   else {
//     next();
//   }
// }
// Index route
router.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
  })
);
//reserve route
router.get("/listings/reserve",(req,res)=>{
  res.render("listings/reserve.ejs");
})
//New route
router.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});


router.get(
  "/user/:email",
  wrapAsync(async (req, res) => {
    const { email } = req.params;

    const ownerUser = await User.findOne({ email });

    if (!ownerUser) {
      return res.status(404).send("User not found");
    }

    const listings = await Listing.find({ owner: ownerUser._id })
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("owner");
    console.log(listings);
      
    if (!listings) {
      req.flash("error", "Requested EasyLiv does not exist");
      res.redirect("/listings");
    }
    res.render("listings/userListings.ejs", { listings });
  })
);
//Show route
router.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("owner");
      
    if (!listing) {
      req.flash("error", "Requested EasyLiv does not exist");
      res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
  })
);

//Create route
router.post(
  "/listings",
  isLoggedIn,
  upload.single("image"),
  validateListing,
  wrapAsync(async (req, res, next) => {
    console.log(req);
    if (!req.file) {
      req.flash("error", "No image uploaded");
    }
    const newListing = new Listing({
      ...req.body.listings,
      image: {
        data: req.file.buffer, // buffer holds the binary data
        contentType: req.file.mimetype,
        filename: req.file.originalname
      }
    });
    console.log(newListing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Easyliv Listed");
    res.redirect("/listings");
  })
);


//Edit route
router.get(
  "/listings/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

//Update route
router.put(
  "/listings/:id",
  isLoggedIn,
  isOwner,
  upload.single("image"),
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {
      ...req.body.listings,
      image: {
        data: req.file.buffer, // buffer holds the binary data
        contentType: req.file.mimetype,
        filename: req.file.originalname
      }
    });
    req.flash("success", "Updated");
    res.redirect(`/listings/${id}`);
  })
);

//Delete route
router.delete(
  "/listings/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "Deleted EasyLiv");
    res.redirect("/listings");
  })
);


module.exports = router;
