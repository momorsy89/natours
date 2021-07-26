const rateLimit=require('express-rate-limit');
const helmet =require('helmet');
const xss =require('xss-clean');
const hpp=require('hpp');
const mongoSanitize=require('express-mongo-sanitize');
const express = require("express");
const app = express();
const tourRouter = require("./Routes/tourRoutes");
const userRouter = require("./Routes/userRoutes");
const reviewRouter = require('./Routes/reviewRoutes');
const globalErrorHandeler = require('./controllers/errorController');
const appError=require('./appError');

//apply data sanitize
app.use(mongoSanitize());

//apply http parameter pollution
app.use(hpp({
  whitelist:['duration']
}));

//apply rate limit
const limiter=rateLimit({
  max:100,
  windowms:60*60*1000,
  message:"your requests limit has been exeeded kindly try again in an hour"
});
app.use('/api',limiter);

//apply helmet
app.use(helmet());

//apply xss-clean
app.use(xss());

// we will use middleware to access request body
app.use(express.json());

//route mounting
app.use("/api/v1/tours", tourRouter),
app.use("/api/v1/users", userRouter),
app.use("/api/v1/reviwes", reviewRouter);

  //handling of unhandeld routs
  app.all("*", (req, res, next) => {
    next(new appError(`can't find ${req.originalUrl} `,404));
  });

 //centerl error handlig middleware function
app.use(globalErrorHandeler);

module.exports = app;
