const crypto=require('crypto');
const { promisify } = require("util");
const User = require("../models/User");
const AppError = require("../appError");
const jwt = require("jsonwebtoken");
const sendEmail = require("../email");

//create a cookie
const cookieOptinos={
  expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
  httpOnly:true
}
if(process.env.NODE_ENV==='production'){
  cookieOptinos.secure=true
}

//better handling for async functions
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

//token siging
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
    passwordResetToken: req.body.passwordResetToken,
    passwordResetExpires: req.body.passwordResetExpires
  });
  //creating new jwt for user just signs up
  const token = signToken(newUser._id);
  //send the token in a cookie
 res.cookie('jwt',token,cookieOptinos);
  res.status(201).json({
    status: "success",
    token,
    data: { user: newUser },
  });
});

//user login
exports.login = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  //1-check if user entered email and password
  if (!email || !password) {
    return next(new AppError("kindly enter a valid email and password", 400));
  }
  //2-check if the entered email and pasword are already exist
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("incorrect email or password", 401));
  }
  //3- if evrything is ok send token to user
  const token = signToken(user._id);
  //send the token in a cookie
  res.cookie('jwt',token,cookieOptinos);
  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //1-get the token and check if it is exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("kindly login to get access", 401));
  }
  //2-token verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3-check if the user is still exist
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError("this user was deleted, kindly login again", 401));
  }

  //4-check if the password not changed after jwt issuance
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("password had been changed", 401));
  }
  //to be able to pass freshuser to the next middleware
  req.user = freshUser;

  next();
});

//Authorization
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("you are not authorized to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1-get the user based on the posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("this user is not exist", 404));
  }
  //2-generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3-send reset token to user email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `if you forgot your password, submit patch request with
   new password and password confirm to:${resetURL}`;
  try {
    await sendEmail({
     email: user.email,
     subject: "your password reset token (valid for 10 mins)",
     message,
    })
    res.status(200).json({
      status: "success",
      msg: "token has been sen to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "something went worng while sending password reset email kindly try again later "+err,
        500
      )
    );
  }
});

exports.resetPassword=catchAsync(async(req,res,next)=>{
  //1-get user based on the reset token
const hashedtoken =crypto.createHash('sha256').update(req.params.token).digest('hex');
//console.log(resetToken+'  '+hashedtoken);
const user=await User.findOne({passwordResetToken:hashedtoken,passwordResetExpires:{$gt:Date.now()}});
//2-if user is exist and token didn't expire, set the new password
if(!user){
  return next(new AppError('token is invalid or expired',400));}
 
  user.password=req.body.password;
  user.confirmPassword=req.body.confirmPassword;
  user.passwordResetToken=undefined;
  user.passwordResetExpires=undefined;
  await user.save();
 //3-update passwordChangedAt proberty
//4-login the user
const token = signToken(user._id);
//send the token in a cookie
res.cookie('jwt',token,cookieOptinos);
res.status(200).json({
  status: "success",
  token,
});
})

exports.updatePassword=catchAsync(async(req,res,next)=>{
//1-check if the user entered the current password correctly
const user =await User.findById(req.user.id).select('+password');
if(! await (user.correctPassword(req.body.currentPassword,user.password))){
  return next(new AppError('worng password, kindly enter your correct password',401))
}
//2- update user password
user.password=req.body.password;
user.confirmPassword=req.body.confirmPassword;
await user.save();
//3-login the user
const token = signToken(user._id);
//send the token in a cookie
res.cookie('jwt',token,cookieOptinos);
res.status(200).json({
  status: "success",
  token,
});
})