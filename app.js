  // Import the necessary modules
require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const ejs = require('ejs');
const mongoose = require('mongoose');
const alumni_bot = require('./alumni_bot');





// Use the User and CommunityGallery models as needed in your application
// ...


alumni_bot.launch();


mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_KEY}@cluster0.mjlk1.mongodb.net/lyceum?retryWrites=true&w=majority/`, { useNewUrlParser: true, useUnifiedTopology: true, writeConcern: { w: 'majority', j: true, wtimeout: 1000 } })
.then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });


  const User = require('./models/user');
  const CommunityGallery = require('./models/community-gallery');
  

  // Create an instance of express
  const app = express();

  // Set the view engine to ejs
  app.set('view engine', 'ejs');

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(express.static(path.join(__dirname, 'public')));

  // Optionally, set the views directory if it isn't named "views"
  app.set('views', path.join(__dirname, '/views'));

  //TEMP
  const user = { name: 'John Doe' };
  const messages = ['Hello', 'Good Morning', 'How are you?'];
  const years = ['2017','2018','2019','2020','2021','2022','2023',];  // Array of years
  const images = ['/images/Ali.jpg', '/images/Jonibek.jpg', '/images/Kamoliddin.jpg','/images/Ali.jpg', '/images/Jonibek.jpg', '/images/Kamoliddin.jpg'];  // Array of image filenames

   


  // Define a route handler for GET requests made to the root path
  app.get('/', (req, res) => {
    
    res.render('index', {years: years, cards:[]});
  });

  app.get('/resources', (req, res) => {
    // your code here, e.g.,:
    res.render('resources');
  });

  app.get('/teachers', (req, res) => {
    // your code here, e.g.,:
    res.render('index', {years: years, cards:[]});
  });

  app.get('/:year', (req, res) => {
    const year = req.params.year;
    // Validate year if needed
    User.find({ gradYear: year, isTeacher: false })
    .then((students) => {
      // nonTeachers is an array of documents matching the query
      // Render the 'year' view with the non-teachers data
      res.render('index', { years: years, cards: students, year: year });
    })
    .catch((error) => {
      console.error('Error fetching non-teachers:', error);
      res.status(500).send('Internal Server Error');
    });
  
  });

  app.get('/:year/community', (req, res) => {
    const year = req.params.year;
    // validate year
    // if valid, render 'community' view, e.g.,:
    res.render('community', { year: year });
  });

  // 404 for all other routes
  app.use(function (req, res, next) {
    res.status(404).send("Sorry, that route doesn't exist.");
  });



  // Start the server on port 3000
  app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });