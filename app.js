const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const nodemailer = require('nodemailer');

// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
// const { listingSchema } = require("./schema.js");
// const Review = require("./models/review.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/EasyLiv');
}
main().then(() => {
  console.log("connection succesful")
}).catch((err) => {
  console.log(err);
})

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));     //data req k andr parse ho pye
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));  //static files ko use krne k liye style.css
app.use(express.static("views/uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const sessionOptions={
  secret:"mysupersecretcode",
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now() + 7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true,
  },
};
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  console.log( res.locals.currUser)
  next();
})
// app.get("/demouser",async(req,res)=>{
// let fakerUser=new User({
//   email:"balpreetkaur0356@gmail.com",
//   username:"balp"
// })
// let registeredUser= await User.register(fakerUser,"hellowrld");
// res.send(registeredUser);
// })

app.get("/", (req, res) => {
  res.render("listings/home.ejs");
})
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  else {
    next();
  }
}
app.use("/",listingRouter);  
app.use("/",reviewRouter); 
app.use("/",userRouter); 


app.post("/mail",async(req,res)=>{
  console.log("Sending mail",req.body);
  
  const email=req.body.email;
  const fName=req.body.fName;
  const lName=req.body.lName;
  const phone=req.body.phone;
  const ownerEmail=req.body.ownerEmail;
  // const {listingID}=req.params
  // console.log("listing ID",listingID);
  // res.render("views/listings/reserve.ejs");
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'balpreetkaur0356@gmail.com',
      pass: 'bsrsvxampxkvsuev',
    },
  });
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>New Property Listing Request</title>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f8f8f8; margin: 0; padding: 20px; }
      .email-container { max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
      .email-header { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #333333; }
      .email-body { font-size: 16px; color: #555555; line-height: 1.6; }
      .detail { margin: 10px 0; padding: 10px; background-color: #f0f0f0; border-radius: 5px; }
      .footer { margin-top: 30px; font-size: 14px; color: #999999; text-align: center; }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-header">You've Got a New Property Listing Request</div>
      <div class="email-body">
        <p>Hello,</p>
        <p>Someone is interested in your property! Here are their details:</p>

        <div class="detail"><strong>First Name:</strong> ${fName}</div>
        <div class="detail"><strong>Last Name:</strong> ${lName}</div>
        <div class="detail"><strong>Email:</strong> ${email}</div>
        <div class="detail"><strong>Phone Number:</strong> ${phone}</div>

        <p>Please reach out to them as soon as possible to discuss further details.</p>
      </div>
      <div class="footer">
        © 2025 Easyliv. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
  const mailOptions = {
    from: 'balpreetkaur0356@gmail.com',
    to: ownerEmail,
    subject: 'New Listing Request — Someone\'s Interested in Your Property!',
    // text: 'This is a test email sent using Nodemailer and Gmail SMTP!',
    html:htmlContent
  };
  
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('Error:', error);
            req.flash("error", "Something went wrong!");
      
    } else {
      console.log('Email sent:', info.response);
      req.flash("success", "The owner will get back to you✅");
    }
  })
  res.sendStatus(200); // or res.status(200).end();

})
// app.get("/testlisting",async (req,res)=>{
//       let samplelist=new Listing({
//         title:"kusum  home",
//         description:"kay my home",
//         price:9000,
//         location:"india",
//         country:"india",
//       })
//   await samplelist.save();
//   console.log("data saved");
//   res.send("data usccessful");
// })

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "page not found"));
})

app.use((err, req, res, next) => {
  let { statusCode, message = "something went wrong" } = err;
  res.render("error.ejs", { message });
  // res.status(statusCode).send(message);
})

app.listen(5000);
