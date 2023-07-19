// Import the necessary modules
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const ejs = require("ejs");
const mongoose = require("mongoose");
const alumni_bot = require("./alumni_bot");

const allowedKeys = [process.env.POST_POLL_API_KEY];

alumni_bot.launch();

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_KEY}@cluster0.mjlk1.mongodb.net/lyceum?retryWrites=true&w=majority/`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      writeConcern: { w: "majority", j: true, wtimeout: 1000 },
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const User = require("./models/user");
const CommunityGallery = require("./models/community-gallery");
const Poll = require("./models/poll");

// Create an instance of express
const app = express();

// Set the view engine to ejs
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Optionally, set the views directory if it isn't named "views"
app.set("views", path.join(__dirname, "/views"));

//TEMP
const user = { name: "John Doe" };
const years = ["2017", "2018", "2019", "2020", "2021", "2022", "2023"]; // Array of years

// Define a route handler for GET requests made to the root path
app.get("/", (req, res) => {
  res.render("index", { years: years, page: "landing", year: null });
});

app.get("/resources", (req, res) => {
  res.render("index", { years: years, page: "resources", year: null });
});

app.get("/teachers", (req, res) => {
  // your code here, e.g.,:
  res.render("index", { years: years, page: "teachers", year: null });
});

app.get("/:year", (req, res) => {
  const year = req.params.year;
  // Validate year if needed
  User.find({ gradYear: year, isTeacher: false })
    .then((students) => {
      // nonTeachers is an array of documents matching the query
      // Render the 'year' view with the non-teachers data
      res.render("index", {
        years: years,
        cards: students,
        year: year,
        page: "main",
      });
    })
    .catch((error) => {
      console.error("Error fetching non-teachers:", error);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/:year/community", (req, res) => {
  const year = req.params.year;
  // validate year
  // if valid, render 'community' view, e.g.,:
  res.render("community", { year: year });
});

const checkAuth = (req, res, next) => {
  const apiKey = req.headers.authorization;
  if (!apiKey || !allowedKeys.includes(apiKey)) {
    return res.status(401).send("Unauthorized: Invalid API key");
  }
  next();
};

app.post("/poll", checkAuth, (req, res) => {
  // Your code for handling the POST request
  const pollData = req.body;
  Poll.findOne({ fName: pollData.fName, lName: pollData.lName })
    .then((existingPoll) => {
      if (existingPoll) {
        // A poll with the same name already exists, do not add a new one

        return res.status(400).send("Poll with the same name already exists");
      } else {
        // No existing poll found, add the new poll to the database
        const poll = new Poll({
          fName: pollData.fName,
          lName: pollData.lName,
          gradYear: pollData.gradYear,
          creatorID: pollData.creatorID,
          imageID: pollData.imageID,
          pollID: pollData.pollID,
          approveCount: pollData.approveCount,
          disapproveCount: pollData.disapproveCount,
        });

        // Save the new poll to the database
        poll
          .save()
          .then((savedPoll) => {
            res.status(200).send("New poll added to the database");
          })
          .catch((error) => {
            res.status(500).send("Internal Server Error");
          });
      }
    })
    .catch((error) => {
      res.status(500).send("Internal Server Error");
    });
  console.log("Damn That works!");
});

app.post("/update-poll", checkAuth, (req, res) => {
  const updateBody = req.body;
  const pollID = updateBody.pollId;
  const option = updateBody.option;

  // Find the poll by its pollID
  Poll.findOne({ pollID: pollID })
    .then((poll) => {
      if (!poll) {
        // Poll not found
        return res.status(404).send("Poll not found");
      }

      // Update the poll based on the chosen option
      if (option === 0) {
        // Increment approveCount
        poll.approveCount++;
      } else if (option === 1) {
        // Increment disapproveCount
        poll.disapproveCount++;
      }

      // Save the updated poll
      poll
        .save()
        .then((updatedPoll) => {
          res.status(200).send("Poll updated successfully");
        })
        .catch((error) => {
          res.status(500).send("Internal Server Error");
        });
    })
    .catch((error) => {
      res.status(500).send("Internal Server Error");
    });
});

// 404 for all other routes
app.use(function (req, res, next) {
  res.status(404).send("Sorry, that route doesn't exist.");
});

// Start the server on port 3000
app.listen(8080, () => {
  console.log("Server is running on http://localhost:3000");
});
