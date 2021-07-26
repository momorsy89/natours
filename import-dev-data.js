const fs=require('fs');
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require('./models/Tour');
const User = require('./models/User');
const Review = require('./models/Review');
//connection to Atlas DB
dotenv.config({ path: "./config.env" });
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection online"))
  .catch((e) => console.log("DB connection faild " + e));
//redaing data
  const tours =JSON.parse(fs.readFileSync(`${__dirname}/app-doc/tours.json`,'utf8'));
  const users =JSON.parse(fs.readFileSync(`${__dirname}/app-doc/users.json`,'utf8'));
  const reviews =JSON.parse(fs.readFileSync(`${__dirname}/app-doc/reviews.json`,'utf8'));

  // data importing function
const importData=async ()=>{
    try{
    await Tour.create(tours);
    await User.create(users,{validateBeforeSave:false});
    await Review.create(reviews);
console.log('data was imported')}
    catch(e){
        console.log('faild importing data '+e)
    }
    process.exit();
}

 // data deleting function
 const deleteData=async ()=>{
    try{
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
console.log('data was deleted')}
    catch(e){
        console.log('faild to delete data '+e)
    }
    process.exit();
}
//deleteData();
importData();