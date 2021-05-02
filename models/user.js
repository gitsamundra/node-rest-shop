const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {type: String, required: true},
  password: {type: String, required: true}
});

userSchema.pre("save", async function(err, next) {
  if(!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch(err) {
    return next(err);
  }
});

userSchema.methods.comparePassword = function(pass, cb) {
  bcrypt.compare(pass, this.password, (err, isMatch) => {
    if(err)
      return cb(err, false);
    else 
      return cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', userSchema);