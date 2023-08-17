// Import the necessary modules
require("dotenv").config();
const express = require("express");
const fs = require('fs');
const bodyParser = require("body-parser");
const path = require("path");
const ejs = require("ejs");
const mongoose = require("mongoose");
const alumni_bot = require("./alumni_bot");
const axios = require("axios");
const multer = require("multer");
const authorizedChatIds = [-1001948673440, -1001966916584]; // DELETE IT LATER


const uploadImage = multer({
  dest: 'uploads/',
  limits: {
      fileSize: 5 * 1024 * 1024, // Limit filesize to 5MB
  },
});



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
const Event = require("./models/landing-event");


// Create an instance of express
const app = express();

// Set the view engine to ejs
app.set("view engine", "ejs");
app.set('trust proxy', true);

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


app.use(express.static(path.join(__dirname, "public")));

app.use("/cropper", express.static("node_modules/cropperjs/dist/"));
app.use("/compressor", express.static("node_modules/compressorjs/dist/"));

app.use("/favicon.ico", (req, res) => res.status(204));

// Optionally, set the views directory if it isn't named "views"
app.set("views", path.join(__dirname, "/views"));

//TEMP
const user = { name: "John Doe" };
const years = ["2017", "2018", "2019", "2020", "2021", "2022", "2023"]; // Array of years

// Define a route handler for GET requests made to the root path
app.get("/", (req, res) => {
  //make a get request to get ladning events

  res.render("index", { years: years, page: "landing", year: null });
});

app.get("/add-member", (req, res) => {
  var year = req.query.year;
  if (year && years.includes(year)) {
    res.render("index", { page: "member", year: year, years: years });
  } else {
    res.status(400).send("Invalid year");
  }
});




app.post('/add-member', uploadImage.single('image'), (req, res) => {
  if (!req.body.src) {
    return res.status(400).send('No image provided');
  }

  const img = req.body.src; // base64 encoded image
  const clientIP = req.ip || req.headers['x-forwarded-for'];
  const fname = req.body.fname;
  const lname = req.body.lname;
  const gradYear = req.body.gradYear;  
  const base64String = req.body.src.split(',')[1];

  const buffer = Buffer.from(base64String, 'base64');

  // Generate a filename
  const filename = `uploads/${fname}-${lname}-${Date.now()}.png`;
  fs.writeFile(filename, buffer, (err) => {
    if (err) {
      console.error('An error occurred:', err);
      return res.status(500).send('An error occurred while saving the image.');
    }

    console.log('Image saved:', filename);
    res.send('Image saved successfully.');
  });



});



app.delete("/delete-member", (req, res) => {
  const { link, year, password } = req.body;
  if (password === process.env.DELETE_AUTH) {
    // Find and delete the user by gradYear and image link
    User.deleteOne({ gradYear: year, image: link })
      .then((result) => {
        if (result.deletedCount > 0) {
          res.json({ success: true });
        } else {
          res.status(404).json({ success: false, message: 'User not found' });
        }
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      });
  } else {
    res.json({ success: false, message: 'Incorrect password' });
  }
});



app.get("/add-community-photo", (req, res) => {
  var year = req.query.year;
  if (year && years.includes(year)) {
    res.render("index", { page: "community-photo", year: year, years: years });
  } else {
    res.status(400).send("Invalid year");
  }
});



// Then use this function as a handler for your route
app.post('/add-community-photo', uploadImage.single('community-image-upload'), handleCommunityPost);

app.delete("/delete-community-photo", (req, res) => {
  const { link, year, password } = req.body;
  if (password === process.env.DELETE_AUTH) {
    // Find the community gallery by year
    CommunityGallery.findOne({ year: year })
      .then((community) => {
        if (community) {
          // Find the index of the link to be deleted
          const index = community.imagesLinks.indexOf(link);
          if (index > -1) {
            // Remove the link from the array
            community.imagesLinks.splice(index, 1);
            
            // Save the updated document
            community.save()
              .then(() => {
                res.json({ success: true });
              })
              .catch((error) => {
                console.log(error);
                res.status(500).json({ success: false, message: 'Failed to save changes' });
              });
          } else {
            res.status(404).json({ success: false, message: 'Link not found' });
          }
        } else {
          res.status(404).json({ success: false, message: 'Year not found' });
        }
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      });
  } else {
    res.json({ success: false, message: 'Incorrect password' });
  }
});


app.get("/resources", (req, res) => {
  res.render("index", { years: years, page: "resources", year: null });
});

app.get("/teachers", (req, res) => {
  // your code here, e.g.,:
  res.render("index", { years: years, page: "teachers", year: null });
});

app.get("/:year", (req, res) => {
  const year = Number(req.params.year);
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
  CommunityGallery.find({ year: year })
    .then((images) => {
      res.render("index", {
        year: year,
        years: years,
        page: "community",
        images: images,
      });
    })
    .catch((error) => {
      console.error("Error fetching images:", error);
      res.status(500).send("Internal Server Error");
    });
  // validate year
  // if valid, render 'community' view, e.g.,:
  //res.render("index", { year: year, years: years, page: "community" });
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
  if(pollData.pollType==0 ){
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
  }else if(pollData.pollType===1){
    console.log("I was here")
    const poll = new Poll({
      fName: pollData.fName,
      lName: pollData.lName,
      gradYear: pollData.gradYear,
      creatorID: pollData.creatorID,
      imageID: pollData.imageID,
      pollID: pollData.pollID,
      approveCount: pollData.approveCount,
      disapproveCount: pollData.disapproveCount,
      pollType:1
    });
    poll.save()
    .then((savedPoll) => {
      res.status(200).send("New poll added to the database");
    })
    .catch((error) => {
      res.status(500).send("Internal Server Error");
    });;

  }
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
        if (poll.approveCount === 1) {
          //Can do something here ?!!!
          if(poll.pollType===0){
                  const { fName, lName, gradYear, imageID } = poll;
                  const getFileUrl = `https://api.telegram.org/bot${process.env.ALUMNI_BOT_TOKEN}/getFile?file_id=${imageID}`;

                  axios
                    .get(getFileUrl)
                    .then((response) => {
                      const filePath = response.data.result.file_path;
                      const fileUrl = `https://api.telegram.org/file/bot${process.env.ALUMNI_BOT_TOKEN}/${filePath}`;

                      // Generate the file name using the specified format
                      const timestamp = Date.now();
                      const fileName = `/images/${gradYear}/${fName}${lName}${timestamp}.jpg`;

                      // Create the graduate year folder if it doesn't exist
                      const yearFolderPath = __dirname + `/public/images/${gradYear}`;
                      if (!fs.existsSync(yearFolderPath)) {
                        fs.mkdirSync(yearFolderPath, { recursive: true });
                      }

                      const savePath = __dirname + `/public/${fileName}`;

                      axios({ url: fileUrl, responseType: "stream" })
                        .then((response) => {
                          response.data
                            .pipe(fs.createWriteStream(savePath))
                            .on("finish", () => {
                              console.log("Image saved:", fileName);

                              // Create a new user object
                              const user = new User({
                                firstName: fName,
                                lastName: lName,
                                gradYear: Number(gradYear),
                                image: fileName,
                              });

                              // Save the user object to the database
                              user
                                .save()
                                .then((savedUser) => {
                                  console.log("User saved:", savedUser);
                                })
                                .catch((error) => {
                                  console.error("Error saving user:", error);
                                });
                            })
                            .on("error", (e) =>
                              console.error("An error has occurred.", e)
                            );
                        })
                        .catch((error) =>
                          console.error("Error getting the file:", error)
                        );
                    })
                    .catch((error) => console.error("Error getting file path:", error));
            
          }else if(poll.pollType==1){
            console.log("Please select I was here");
            
              const { fName, lName, gradYear, imageID, approveCount } = poll;
              if (approveCount === 1) {
                const getFileUrl = `https://api.telegram.org/bot${process.env.ALUMNI_BOT_TOKEN}/getFile?file_id=${imageID}`;
            
                axios
                  .get(getFileUrl)
                  .then((response) => {
                    const filePath = response.data.result.file_path;
                    const fileUrl = `https://api.telegram.org/file/bot${process.env.ALUMNI_BOT_TOKEN}/${filePath}`;
            
                    // Generate the file name using the specified format
                    const fileName = `/images/${gradYear}/community/${fName}${lName}.jpg`;
            
                    // Create the graduate year and community folders if they don't exist
                    const communityFolderPath = path.join(__dirname, `/public/images/${gradYear}/community`);
                    console.log(communityFolderPath);
                    if (!fs.existsSync(communityFolderPath)) {
                      fs.mkdirSync(communityFolderPath, { recursive: true });
                    }
            
                    const savePath = path.join(__dirname, `/public/${fileName}`);
            
                    axios({ url: fileUrl, responseType: "stream" })
                      .then((response) => {
                        response.data
                          .pipe(fs.createWriteStream(savePath))
                          .on("finish", () => {
                            // Save the user object to the database
                            CommunityGallery.findOneAndUpdate(
                              { year: gradYear },
                              { $push: { imagesLinks: fileName } },
                              { new: true, upsert: true }
                            )
                            .then(() => console.log('Image link added to CommunityGallery'))
                            .catch(err => console.error('Error updating CommunityGallery:', err));
                          })
                          .on("error", (e) =>
                            console.error("An error has occurred.", e)
                          );
                      })
                      .catch((error) =>
                        console.error("Error getting the file:", error)
                      );
                  })
                  .catch((error) => console.error("Error getting file path:", error));
              }
            
          }
          
        }
        // Fetch fName, lName, gradYear, and imageID
        // Get the file details
      } else if (option === 1) {
        // Increment disapproveCount
        poll.disapproveCount++;
      }

      // Save the updated poll
      poll
        .save()
        .then(() => {
          res.status(200).send("Poll updated successfully");
        })
        .catch((error) => {
          console.error("Error updating poll:", error);
          res.status(500).send("Error updating poll");
        });
    })
    .catch((error) => {
      console.error("Error finding poll:", error);
      res.status(500).send("Error finding poll");
    });
});
// 404 for all other routes
app.use(function (req, res, next) {
  res.status(404).send("Sorry, that route doesn't exist.");
});
async function handleCommunityPost(req, res, next) {
  const clientIP = req.ip || req.headers['x-forwarded-for'];
  const year = req.body.year;
  const image = req.file; // Assumes the image file is in the request

  // Perform any necessary validation checks here...

  // Send the image with caption to the specific group
  const imageCaption = `Image for the year ${year}`;
  const sentPhoto = await alumni_bot.telegram.sendPhoto(authorizedChatIds[1], { source: image.path }, { caption: imageCaption });

  // Create the poll
  const pollQuestion = `Do you approve this image for the year ${year}?`;
  const pollOptions = ["Yes", "No"];
  
  // Send the poll to the specific group
  const pollMessage = await alumni_bot.telegram.sendPoll(authorizedChatIds[1], pollQuestion, pollOptions, {
    is_anonymous: false, // Change to true if you want the poll to be anonymous
    allows_multiple_answers: false,
    open_period: 300
  });

  // Save the poll to the MongoDB database
    const poll = new Poll({
      pollType:1,
      ipAddress:clientIP,
      fName: `Community-${Date.now()}`,
      lName: "Image", 
      gradYear: year,
      creatorID: 0, 
      imageID: sentPhoto.photo[sentPhoto.photo.length - 1].file_id,
      pollID: pollMessage.poll.id
  });
  poll.save()
    .then(() => {
      res.status(200).json({ message: 'Image and poll created successfully!' });

      fs.unlink(image.path, (err) => {
        if (err) {
          console.error('Error deleting temporary file:', err);
        } else {
          console.log('Temporary file deleted successfully');
        }
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Failed to create image or poll.' });
    });
}

async function handleMemberPost(req, res, next) {

  const clientIP = req.ip || req.headers['x-forwarded-for'];
  console.log(body)




}

// Start the server on port 3000
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
