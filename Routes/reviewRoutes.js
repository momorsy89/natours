const Review = require("../models/Review");
const express = require("express");
const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

//get all reviews
router.route("/").get(reviewController.allReviews);

//add new review
router
  .route("/")
  .post(
    authController.restrictTo("user"),reviewController.fillTourAndUser,
    reviewController.addReview
  );

//delete a review by id
router
  .route("/:id")
  .delete(
    authController.restrictTo("admin",'user'),
    reviewController.deleteReview
  );

//update a review by id
router
.route("/:id")
.patch(
  authController.restrictTo("admin",'user'),
  reviewController.updateReview
);

//get a review by id
router
.route("/:id")
.get(
  reviewController.getReview
);


module.exports = router;
