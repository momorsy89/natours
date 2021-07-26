const fs = require("fs");
const express = require("express");
const Tour = require("../models/Tour");
const tourController = require("../controllers/tour_controller");
const authController = require("../controllers/authController");
const reviewRouter = require("../Routes/reviewRoutes");
//Routers
const router = express.Router();

//top 5 cheap tours
router
  .route("/top-5-cheap")
  .get(tourController.alaisTopTours, tourController.getTours);

//aggergate pipeline
router.route("/tour-stats").get(tourController.getToursStats);

//get all tours
router.route("/").get(tourController.getTours);

//get tour by id
router.route("/:id").get(tourController.getTourById);

//get tours with certin distance
router.route('/tour-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);

//get all tours distance fron certin location
router.route('/distances/:latlng/unit/:unit').get(tourController.getToursDistances);

//add new tour
router
  .route("/")
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.createTour
  );

//update a tour
router
  .route("/:id")
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.updateTour
  );

//delete a tour
router
  .route("/:id")
  .delete(
    authController.protect,
    authController.restrictTo("admin", "tour-guide"),
    tourController.deleteTour
  );

//get monthly paln
router.route("/monthly-plan/:year").get( authController.protect,
  authController.restrictTo("admin", "lead-guide",'guide'),tourController.getMonthlyPlan);

//add review for a spesific tour (rerouting)
router.use("/:tourId/reviews", reviewRouter);

module.exports = router;
