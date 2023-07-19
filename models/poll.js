const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
    fName: {
      type: String,
      required: true
    },
    lName: {
      type: String,
      required: true
    },
    gradYear: {
      type: Number,
      required: true
    },
    creatorID: {
        type: Number,
        required: true
    },
    pollID: {
        type: Number,
        required: true
    },
    imageID: {
      type: String,
      required: true,
      default: ""
    },
    approveCount:{
        type: Number,
        required: true,
        default: 0
    },
    disapproveCount:{
        type: Number,
        required: true,
        default: 0
    }
  });
  
  const Poll = mongoose.model('poll', pollSchema);
  
  module.exports = Poll;