const Review = require("../models/Review");
const factory = require("../controllers/handlerFactory");

//better handling for async functions
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

exports.allReviews = factory.getAll(Review);

//fill tour & user in req body
exports.fillTourAndUser = (req, res, next) => {
  //nested tour routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

//add a review
exports.addReview = factory.createOne(Review);
//delete a review by id
exports.deleteReview = factory.deleteOne(Review);
//update a review by id
exports.updateReview = factory.updateOne(Review);
//get a review by id
exports.getReview = factory.getOne(Review);

