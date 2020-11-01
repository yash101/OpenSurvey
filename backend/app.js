require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const expressSession = require('express-session');
const passport = require('passport');

const dbMain = require('./database/pg_other');
const dbData = require('./database/pg_data');
const config = require('./database/config');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');

module.exports = (async () => {

  const app = express();

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  app.use(logger('dev'));
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  await config.ready;
  
  app.use(expressSession({
    secret: (await config.get('auth.secret', process.env.AUTH_SECRET || 'test secret')).val,
    resave: false,
    saveUninitialized: false,
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/', indexRouter);
  app.use('/auth', authRouter);

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

  return app;
})();
