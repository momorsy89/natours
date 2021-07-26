const appError = require('../appError');
const ApiFeatures = require("../apiFeatures");

//better handling for async functions
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

//delete document by id
exports.deleteOne = Model => catchAsync(async (req, res, next) => {
  const doc = await Model.findByIdAndDelete(req.params.id);
  if (!doc) {
    return next(new appError("cann't find a document by that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

//update doc by id
exports.updateOne = Model => catchAsync(async (req, res, next) => {
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    return next(new appError("cann't find a document by that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: { doc },
  });
});

//creating new doc by client
exports.createOne = Model => catchAsync(async (req, res, next) => {
  const doc = await Model.create(req.body);
  res.status(201).json({
    status: "success",
    data: { doc },
  });
});

//getting one doc by client
exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
  let query={};
  query = Model.findById(req.params.id);
  if (popOptions) {
    query = query.populate(popOptions);
  }
  const doc = await query;

  if (!doc) {
    return next(new appError("cann't find a document by that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: { doc },
  });
});

//get all docs
exports.getAll = Model=> catchAsync(async (req, res, next) => {
  // to allow nested url of tour in reviews
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  //query execution
  const features = new ApiFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .project()
    .paginate();
  const docs = await features.query//.explain()//to get statistics about our query;
  /////////////////////////////////
  res.status(200).json({
    status: "success",
    result: docs.length,
    data: { docs },
  });
});