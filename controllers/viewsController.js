const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 2) Build template
  // 3) Render template using data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.googleAuth = (req, res) => {
  res.status(200).render('auth', {
    title: 'auth account'
  });
};
exports.index = (req, res) => {
  res.status(200).render('index', {
    title: 'auth account'
  });
};

exports.signByGmail = (req, res) => {
  res.status(200).render('success', {
    title: 'auth account'
  });
};

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};
exports.signwithgmail = (req, res) => {
  res.status(200).render('signwithgmail', {
    title: 'sign up with gmail'
  });
};


exports.getSignUpForm = (req, res) => {
  res.status(200).render('signup', {
    title: `Create New Account`,
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});


exports.getforgotPasswordForm = (req, res) => {
  if(!res.locals.user){ // only if no user connected we can access to this page
      const { token } = req.query;
      res.status(200).render('forgotPassword', {
          title: 'Set your new password',
          token
      })
  } else {
      res.redirect('/')
  }
}



exports.getresetPasswordForm = (req, res) => {
  if(!res.locals.user){ // only if no user connected we can access to this page
      const { token } = req.query;
      res.status(200).render('resetPassword', {
          title: 'Set your new password',
          token
      })
  } else {
      res.redirect('/')
  }
}