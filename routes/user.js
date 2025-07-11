const express = require("express");
const router = express.Router();
const User=require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {saveRedirectUrl}=require("../middleware.js");

router.get("/signup",(req,res)=>{
  res.render("users/signup.ejs");
})
router.post("/signup",
    wrapAsync( async(req,res)=>{
      try{
        let{username,email,password}=req.body;
        const newUser=new User({email,username});
          const registeredUser=await User.register(newUser,password);
          console.log(registeredUser);
          req.login(registeredUser,(err)=>{
            if(err){
              return next(err)
            }
            req.flash("success","Welcome to EasyLiv!");
            // const redirectUrl = req.session.redirectUrl;
            // console.log(redirectUrl)
            res.redirect("/listings/new");
          }) 
      }catch(err){
        req.flash("error",err.message);
        res.redirect("/signup")
      }
})
)
router.get("/login",(req,res)=>{
  res.render("users/login.ejs");
})
router.post("/login", 
  saveRedirectUrl,
  passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),
  async(req,res)=>{
    req.flash("success","Welcome Back to EasyLiv");
    const redirectUrl = res.locals.redirectUrl || "/listings/new" ;
    // delete req.session.redirectUrl;
    res.redirect(redirectUrl)  
    // res.redirect("/listings/new") 
})

router.get("/logout",(req,res,next)=>{
  req.logout((err)=>{
    if(err){
      return next(err);
    }
    req.flash("success","You are logged out")
    res.redirect("/listings")
  })
})

module.exports=router;