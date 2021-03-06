const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const helmet = require('helmet');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

const serviceAccount = require('./admin-firebase-sdk.json');
const lineup2018 = require('./lineup/lineup-2018.json');
const webpushTopicsRouter = require('./routes/webpushTopics');
const indexRouter = require('./routes/index');
const EventMessageSender = require('./eventMessageSender');

const app = express();

const env = app.get('env');
const isDevelopment = env === 'development';
const port = process.env.PORT || 5000;

const HEROKU_APP_NAME = 'void-fest-pwa';
const MONITORING_URL = 'http://nosnch.in/3678d53b62?m=just+checking+in';

console.log('NODE_ENV', env);

if (isDevelopment) {
  // Use local .env for development mode
  dotenv.config();
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

app.use(express.static(path.join(__dirname, 'public')));

// Handle CORS
if (isDevelopment) {
  // Allow all on development environment
  app.use(cors());
} else {
  app.use(
    cors({
      origin: 'https://void-fest-app.netlify.com'
    })
  );
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Initialize Firebase app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://void-fest-pwa.firebaseio.com'
});

// Routes
app.use('/', indexRouter);
app.use('/api/webpush/topic', webpushTopicsRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
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

// The event message sender for Void Fest 2018
new EventMessageSender('voidfest2018', lineup2018.events).start();

app.listen(port, () => {
  console.log(`🚀 Server started on port ${port} ...`);
});
