const mongoose = require('mongoose');

const landingEventSchema = new mongoose.Schema({

    title:{
        type: String,
        required: true
    },
    image:{ 
        type: String,
        required:true
    },
    comment:{
        type: String,
        required:false
    },
    date:{
        type:Number,
        required:true
    }
});

const Event = mongoose.model('event', landingEventSchema);

module.exports = Event;
