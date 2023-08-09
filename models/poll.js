const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
    pollType: {
      type: Number,
      required: true,
      default: 0
    },
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
        type: String,
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
    },
    ipAddress: {
      type: String, // Store the IP address as a string
      required: false // Make it optional if not all documents will have an IP address
    }
  });
  
  const Poll = mongoose.model('poll', pollSchema);
  
  module.exports = Poll;