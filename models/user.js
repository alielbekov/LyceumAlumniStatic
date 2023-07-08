const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  gradYear: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true,
    default: "filler.jpg"

  },
  isTeacher: {
    type: Boolean,
    required: true,
    default: false
  }
});

const User = mongoose.model('user', userSchema);

module.exports = User;
