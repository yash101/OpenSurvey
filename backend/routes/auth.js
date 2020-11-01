const express = require('express');
const passport = require('passport');
const { catch } = require('../app');
const localStrategy = require('passport-local').Strategy;

const User = require('../database/user');

const router = express.Router();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  try {
    const user = await User.get(id);
    this.connect(null, user);
  } catch(err) {
    done(err, null);
  }
})

router.post('/register', async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const fname = '';
  const lname = '';
  const role = 'user';

  try {
    const id = await User.newUser({
      email: req.body.email,
      password: req.body.password,
      fname: '',
      lname: '',
      role: 'user',
    });

    res.json(await User.get(id), 200);
  } catch(err) {
    console.error(err);
    res.json(err, 500);
  }
});

router.post('/authenticate', async (req, res, next) => {
  status = false;
  let auth;
  if (req.body.email && req.body.password) {
    auth = await User.authenticateEmail(req.body.email, req.body.password);
    status = true;
  }
  if (status && auth && auth.matches === true) {
    res.json({
      status: 'success',
      data: auth,
    }, 200);
  } else {
    res.json({
      status: 'failure',
      reason: 'email or password was not provided or the email and password did not match for any account',
    }, 401);
  }
});

module.exports = router;
