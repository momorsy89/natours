const User = require("../models/User");
const AppError = require("../appError");
const { findByIdAndUpdate } = require("../models/User");
const factory=require('../controllers/handlerFactory');

//better handling for async functions
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

//filter updated properities
const filterObj=(obj,...allwoedFileds)=>{
  const newObj={};
  Object.keys(obj).forEach(el=>{
    if(allwoedFileds.includes(el)){
    newObj[el]=obj[el];
  }});
  return newObj;
}

// get all users
exports.getAllUsers = factory.getAll(User);

//get me
exports.getMe=(req,res,next)=>{
  req.params.id=req.user.id;
  next();
}

// get one user by id
exports.getUser = factory.getOne(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};

// update user data
exports.updateMe = catchAsync(async (req, res, next) => {
  //1-check if user will not update his password
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        "cannot change your password here kindly visit /updatePassord",
        400
      )
    );
  }
  //2-update the user
  const filtteredBody = filterObj(req.body, "name", "email");
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filtteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status:'success',
    user:updatedUser
  })
});

// delete user
exports.deleteMe=catchAsync(async(req,res,next)=>{
  await User.findByIdAndUpdate(req.user.id,{active:false});
  res.status(204).json({
    status:'success',
    data:null
  })
})
