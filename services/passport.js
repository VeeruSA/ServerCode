const passport = require('passport');
const Student = require('../models/student');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

// Create Local Strategy
const localOptions = { studentnameField: 'email' };
const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
  // Verify this email and password, call done with the student
  // if it is the correct email and password
  // Otherwise, call done with false
  Student.findOne({ email: email}, function(err, student) {
    console.log("Inside LocalLogin...."); 
    if (err) { return done(err); }
    if (!student) { return done(null, false); }

    // Compare passwords -is 'password' equal to student.password???
    student.comparePassword(password, function(err, isMatch) {
      if (err) { return done(err); }
      if (!isMatch) { return done(null, false); }

      return done(null, student);
    });
  });
});

// Setup options for JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret
};

// Create JWT Strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
  // See if the student ID in the payload exists in your database
  // If it does, call 'done' with that student
  // Otherwise, call 'done' without a user object
  Student.findById(payload.sub, function(err, student) {
    if(err) { return done(err, false); }

    if(student) {
      done(null, student);
    }else {
      done(null, false);
    }
  });
});

// Tell passport to use this Strategy
passport.use(jwtLogin);
passport.use(localLogin);
