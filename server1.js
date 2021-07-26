const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

//handling of unhandled rejections
process.on("unhandledRejection", (err) => {
  console.log("unhandled rejection shutting down......");
  console.log(err.name, err.message);
    process.exit(1);
  });

//handling of uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("uncaught Exception shutting down......");
  console.log(err.name, err.message);
    process.exit(1);
  });

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

//to change eviroment
//process.env.NODE_ENV = 'production';
console.log(process.env.NODE_ENV);


//server start
const server = app.listen(3000, () => {
  console.log("listining to port 3000......");
});

