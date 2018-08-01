const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const helmet = require('helmet');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const serviceAccount = require('./admin-firebase-sdk.json');
const webpushTopicsRouter = require('./routes/webpushTopics');
const indexRouter = require('./routes/index');

const app = express();

const env = app.get('env');
const isDevelopment = env === 'development';
const port = process.env.PORT || 5000;

const HEROKU_APP_NAME = 'void-fest-pwa';
const MONITORING_URL = 'https://nosnch.in/3678d53b62 ';

console.log('NODE_ENV', env);

if (isDevelopment) {
  // Use local .env for development mode
  require('dotenv').config();
}

// Insert private key via environment variable
serviceAccount.private_key_id = process.env.PRIVATE_KEY_ID;
serviceAccount.private_key = isDevelopment
  ? process.env.PRIVATE_KEY
  : JSON.parse(process.env.PRIVATE_KEY);

app.use(helmet());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(logger('dev'));
app.use(cookieParser());

// Initialize Firebase app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://void-fest-pwa.firebaseio.com'
});

// Routes
app.use('/', indexRouter);
app.use('/api/webpush/topic', webpushTopicsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Keep free Heroku web dyno alive
setInterval(() => {
  http.get(`http://${HEROKU_APP_NAME}.herokuapp.com`);
}, 5 * 60 * 1000); // every 5 minutes

// Monitoring
setInterval(() => {
  http.get(MONITORING_URL);
}, 1800 * 1000); // every 30 minutes

app.listen(port, () => {
  console.log(`🚀 Server started on port ${port} ...`);
});
