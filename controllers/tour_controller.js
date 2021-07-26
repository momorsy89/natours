const mongoose = require("mongoose");
const Tour = require("../models/Tour");
const ApiFeatures = require("../apiFeatures");
const appError=require('../appError');
const factory=require('../controllers/handlerFactory');

//better handling for async functions
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

//creating new tour by client
exports.createTour = factory.createOne(Tour);

//top 5 cheap tours
exports.alaisTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,summary,difficulty,ratingsAverage";
  next();
};

//get all tours
exports.getTours = factory.getAll(Tour);
 
//get a tour by id and passing populate options (reviews)
exports.getTourById = factory.getOne(Tour,'reviews');

//update tour by id
exports.updateTour = factory.updateOne(Tour)

//delete tour by id
exports.deleteTour = factory.deleteOne(Tour);

//aggergation pipeline
exports.getToursStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: "$difficulty",
        avgRating: { $avg: "$ratingsAverage" },
        numRatings: { $sum: "$ratingsQuantity" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        numTours: { $sum: 1 },
      },
    },
    { $sort: { avgPrice: 1 } },
  ]);
  res.status(200).json({
    status: "success",
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numStartTours: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    { $addFields: { month: "$_id" } },
    { $project: { _id: 0 } },
    { $sort: { numStartTours: -1 } },
  ]);
  res.status(200).json({
    status: "success",
    data: { plan },
  });
});
//get tours within certin distance
exports.getToursWithin=catchAsync(async(req,res,next)=>{
  const {distance,latlng,unit}=req.params;
  const [lat,lng]=latlng.split(',');
  const radious= unit==='mi'? distance/3963.2 : distance/6378.1;
  if (!lat || !lng){
    return next(new appError('kindly enter your location in format lng.lat',400))
  }
 const tours= await Tour.find({
  startLocation: {$geoWithin:{$centerSphere:[[lng,lat],radious]}
 }})
  res.status(200).json({
    status:'success',
    results:tours.length,
    data:tours
  })
})
//get all tours distances from certin location
exports.getToursDistances=catchAsync(async(req,res,next)=>{
  const {latlng,unit}=req.params;
  const [lat,lng]=latlng.split(',');
  const multiplier= unit==='mi'? 0.000621 : 0.001;
  if (!lat || !lng){
    return next(new appError('kindly enter your location in format lng.lat',400))
  }
  const distances=await Tour.aggregate([{
    $geoNear:{
      near:{
        type:'Point',
        coordinates:[lng*1,lat*1]
      },
      distanceField:'distance',
      distanceMultiplier:multiplier
    }},
    {$project:{
      name:1,
      distance:1
    }
  }
  ])
  res.status(200).json({
    status:'success',
    results:distances.length,
    data:distances
  })
})








