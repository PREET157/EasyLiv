const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");


async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/EasyLiv");
  // initDB();
}
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

const initDB = async () => {
  await Listing.deleteMany({});
   initData.data=initData.data.map((obj)=>({...obj,owner:"67f95cc1d1743518d68f5804"}))

  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};
initDB();

