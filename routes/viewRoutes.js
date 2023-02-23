const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/signup', viewsController.getSignUpForm);
router.get('/gmailsign', viewsController.getgmailsign);
router.get('/forgotPassword', viewsController.getforgotPasswordForm);
router.get('/resetPassword', viewsController.getresetPasswordForm);
router.get('/auth', viewsController.googleAuth);
router.get('/success', viewsController.googleSuccess);


router.get('/me', authController.protect, viewsController.getAccount);




router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
