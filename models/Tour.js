const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
//const User = require("../models/User");

//creating schema for tours
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      unique: true,
      maxLength: [40, "name must be less than 40 letters"],
      minLength: [10, "name must be grater than 10 letters"],
      //validate:[validator.isAlpha,'name must be letters only']
    },
    duration: {
      type: Number,
      required: [true, "a tour must have a duration"],
    },
    slug: String,
    maxGroupSize: {
      type: Number,
      required: [true, "a tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "a tour must have a Difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "tour difficulty is either easy or meduim or difficult",
      },
    },

    price: { type: Number, required: [true, "price is required"] },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "rating must be grater than 1"],
      max: [5, "rating must be less than 5"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: { type: Number, default: 0 },
    priceDiscount: Number,
    summary: {
      type: String,
      required: [true, "a tour must have a summery"],
    },
    discription: {
      type: String,
      trim: true,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: "price discount must be less than price",
      },
    },
    imageCover: {
      type: String,
      required: [true, "a tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      //select:false
    },
    startDates: [Date],
    secretTours: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    // define schema options
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//virtual proberties
tourSchema.virtual("durationWeek").get(function () {
  return this.duration / 7;
});
//virtual populate
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

//document middleware
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name);
  next();
});

//post document middlware
tourSchema.post("save", function (doc, next) {
  // console.log(doc);
  next();
});

//querry middlewarw
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTours: { $ne: true } });
  next();
});

//post querry middlewarw
tourSchema.post(/^find/, function (docs, next) {
  // console.log(docs);
  next();
});

//aggergation middlewarw
/*
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTours: { $ne: true } } });
  next();
});
*/

//embbed tour-guides users in tour document
/*
tourSchema.pre('save',async function (next) {
const guidesPromises=this.guides.map(async id=>await User.findById(id));
this.guides=await Promise.all(guidesPromises);
 next();
})
*/

//using populate
tourSchema.pre(/^find/, function (next) {
  this.populate("guides");
  next();
});

//using index with some fields
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
//geospatial index for tour start location
tourSchema.index({startLocation:'2dsphere'});

//creating Tour model based on tourSchema
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
