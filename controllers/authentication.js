const jwt = require('jwt-simple');
const Student = require('../models/student');
const config = require('../config');

function tokenForStudent(student) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: student.id, iat: timestamp }, config.secret);
}

exports.signin = function(req, res, next) {
  console.log("Inside signin..");
  // Student has already had their email and password auth'd
  // We just need to give them a token
  res.send({ token: tokenForStudent(req.student) });
}

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(422).send({ error: 'You must provide email and password' });
  }

  // See if a Student with the given email exists
  Student.findOne({ email: email}, function(err, existingStudent){
    if (err) { return next(err); }

    // If a Student with email exists, return an error
    if (existingStudent) {
      return res.status(422).send({ error: 'Email is in use' });
    }

    // If a Student with email does not exists, create and save student record
    const student = new Student({
      email: email,
      password: password
    });

    student.save(function(err) {
      if (err) { return next(err); }

      // Respond to request indicating the student was created
      res.json({ token: tokenForStudent(student) });
    });
  });
}
