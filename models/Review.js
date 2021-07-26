const tourController = require("../controllers/tour_controller");
const mongoose = require("mongoose");
const Tour = require("./Tour");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, "rating must be grater than 1"],
      max: [5, "rating must be less than 5"],
    },
    createdAt: { type: Date, default: Date.now() },
    tour: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Tour",
        required: [true, "Review must belonge to a tour"],
      },
    ],
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Review must belonge to a user"],
      },
    ],
  },
  {
    // define schema options
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//populating related user and tour
reviewSchema.pre(/^find/, function (next) {
  // this.populate('tour');
  this.populate({
    path: "user",
    select: "name",
  });
  next();
});

//calculate actual avergaeRatings and ratingsQuantity
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: "$tour",
        nRatings: { $sum: 1 },
        avgRatings: { $avg: "$rating" },
      },
    },
  ]);
if(stats.length>0){
  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].avgRatings,
    ratingsQuantity: stats[0].nRatings,
  })}
  else {await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: 4.5,
    ratingsQuantity:0,
  })}
};
//calc function call after adding new review
reviewSchema.post('save',function(){
  this.constructor.calcAverageRatings(this.tour);
})

//calc function call after review update&delete
reviewSchema.pre(/^findOneAnd/,async function(next){
  this.r=await this.findOne();
  next();
})
reviewSchema.post(/^findOneAnd/,async function(){
  await this.r.constructor.calcAverageRatings(this.r.tour);
})

//preventing multiple reviews from same user on same tour
reviewSchema.index({tour:1,user:1},{unique:true});

//creating Review model based on tourSchema
const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
