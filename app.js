const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const catchAsync = require('./utils/catchAsync');
const authController = require('./controllers/authController');

const app = express();

app.set('view engine', 'pug');

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers



app.use(helmet.contentSecurityPolicy({
    directives: {
      'defaultSrc': ["'self'",'https://*.mapbox.com'],
      'child-src': ['blob:'],
      'connect-src': ["'self'",'https://*.mapbox.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'img-src': ["'self'", 'data:', 'blob:'],
      'script-src': ["'self'", 'https://*.mapbox.com'],
      'style-src': ["'self'", 'https:'],
      'worker-src': ['blob:'],
      'frame-src': ['self']
    }
  }
)
);



// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);


app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);


/*  EXPRESS */

const session = require('express-session');

app.set('view engine','pug');

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));


const passport = require('passport');
var userProfile;
app.use(passport.initialize());
app.use(passport.session());

app.get('/views/success', authController.signByGmail);

app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};


const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};
 
// GOOGLE_CLIENT_ID = '780391168365-rk24hn993p5vosr3b494j71bpranuegr.apps.googleusercontent.com
// GOOGLE_CLIENT_SECRET = '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



const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = '780391168365-rk24hn993p5vosr3b494j71bpranuegr.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
passport.use(new GoogleStrategy({
    clientID: '780391168365-rk24hn993p5vosr3b494j71bpranuegr.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));
 
app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/views/success');

  });






  // signup = catchAsync(async (req, res, next) => {
  //   const newUser = await User.create({
  //     name: user.Name[0].value,
  //     email: user.email[0].value
  //   });
  
  //   const url = `${req.protocol}://${req.get('host')}/me`;
  //   // console.log(url);
  //   await new Email(newUser, url).sendWelcome();
  
  //   createSendToken(newUser, 201, res);
  // }),

  // );








// MongoClient.connect(mongoUrl,(err,client)=>{
//     if(err) console.log("Error while connecting")
//     else db = client.db('Natours'); 
// console.log('DB connection skillfully !')
// })





app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
