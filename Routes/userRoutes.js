const express =require('express');
const authController=require('../controllers/authController');
const userController = require('./../controllers/userController');

//Routers
const router=express.Router();

//user signup
router.post('/signup',authController.signup);

//user login
router.post('/login',authController.login);

//user forgot password
router.post('/forgotPassword',authController.forgotPassword);

//user reset password
router.patch('/resetPassword/:token',authController.resetPassword);

//user update password
router.patch('/updatePassword',authController.protect,authController.updatePassword);

//user update
router.patch('/updateMe',authController.protect,userController.updateMe);

//delete user
router.patch('/deleteMe',authController.protect,userController.deleteMe);

//get me
router.get('/me',authController.protect,userController.getMe,userController.getUser);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;