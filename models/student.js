const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

// Define our model
const studentSchema = new Schema({
  email: { type: String, unique:true, lowercase: true },
  password: String
});

// On save hook, Encrypt password
 // Before saving a model, run this function
studentSchema.pre('save', function(next){
  // Get access to the student model
  const student = this;

  // Generate a salt, then run the callback
  bcrypt.genSalt(10, function(err, salt) {
    if (err) { return next(err); }

    // Hash (Encrypt) our password using the salt
    bcrypt.hash(student.password, salt, null, function(err, hash) {
      if(err) { return next(err); }

      // Overwrite plain text password with encrypted password
      student.password = hash;
      next(); // Go ahead and save the model
    })
  });
});

studentSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) { return callback(err); }

    callback(null, isMatch);
  });
}


// Create the model class
const ModelClass = mongoose.model('student', studentSchema);

// Export the model
module.exports = ModelClass;
