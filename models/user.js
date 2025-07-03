// const { string } = require("joi");
const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");

const userSchema=new Schema({     //passport-local-mongoose will automatically add username , hash and salt field to 
  email:{                         //store username and hashed password and its salt value automatically thus we dont have
    type:String,                  // to create username and password in userschema 
    required:true,
  }
})

userSchema.plugin(passportLocalMongoose);
const User=mongoose.model("User",userSchema);

module.exports=User;