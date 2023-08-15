// JShint esversion: 6
require("dotenv").config();
const { Telegraf, session } = require("telegraf");
const request = require("request");
const e = require("express");
const Poll = require("./models/poll");
// Change this array to include the chat IDs where you want your new bot to operate
const authorizedChatIds = [-1001948673440, -1001966916584];

// Change BOT_TOKEN to the token of your new bot
const alumni_bot = new Telegraf(process.env.ALUMNI_BOT_TOKEN);

alumni_bot.use(session());

alumni_bot.command("help", (ctx) => {
  // Check if the chat ID is authorized
  if (isChatAuthorized(ctx.chat.id)) {
    // Change this line if you want to send a different image or another response
    const rulesFilePath = __dirname + "/public/images/rules.png";

    // Send the 'rules.png' file as a reply
    ctx.replyWithPhoto({ source: rulesFilePath });
  } else {
    // Reply with an error message if the chat is not authorized
    ctx.reply("Unauthorized access.");
  }
});

alumni_bot.command("quote", (ctx) => {
  // Check if the chat ID is authorized
  if (isChatAuthorized(ctx.chat.id)) {
    const apiKey = process.env.QUOTES_API_KEY;

    // Send a GET request to the API Ninja Quotes API
    request.get(
      {
        url: `https://api.api-ninjas.com/v1/quotes?`,
        headers: {
          "X-Api-Key": apiKey,
        },
      },
      function (error, response, body) {
        if (error) {
          console.error("Request failed:", error);
          ctx.reply("Failed to fetch a quote. Please try again.");
        } else if (response.statusCode !== 200) {
          console.error("Error:", response.statusCode, body.toString("utf8"));
          ctx.reply("Failed to fetch a quote. Please try again.");
        } else {
          const quoteData = JSON.parse(body);
          const quote = quoteData[Math.floor(Math.random() * quoteData.length)];
          ctx.reply(`"${quote.quote}" - ${quote.author}`);
        }
      }
    );
  } else {
    // Reply with an error message if the chat is not authorized
    ctx.reply("Unauthorized access.");
  }
});

alumni_bot.command("fact", (ctx) => {
  // Check if the chat ID is authorized
  if (isChatAuthorized(ctx.chat.id)) {
    const apiKey = process.env.QUOTES_API_KEY;

    // Send a GET request to the API Ninja Quotes API
    request.get(
      {
        url: `https://api.api-ninjas.com/v1/facts?`,
        headers: {
          "X-Api-Key": apiKey,
        },
      },
      function (error, response, body) {
        if (error) {
          console.error("Request failed:", error);
          ctx.reply("Failed to fetch a quote. Please try again.");
        } else if (response.statusCode !== 200) {
          console.error("Error:", response.statusCode, body.toString("utf8"));
          ctx.reply("Failed to fetch a quote. Please try again.");
        } else {
          const factData = JSON.parse(body);
          const fact = factData[Math.floor(Math.random() * factData.length)];
          ctx.reply(`"${fact.fact}" - api-ninja`);
        }
      }
    );
  } else {
    // Reply with an error message if the chat is not authorized
    ctx.reply("Unauthorized access.");
  }
});
alumni_bot.command("add", (ctx) => {
  ctx.session = {};
  // Check if the chat ID is authorized
  if (isChatAuthorized(ctx.chat.id)) {
    // Send a welcome message and ask for the user's first name
    ctx.reply(
      "Welcome! Please provide your details.\n\nPlease enter your first name:"
    );
    // Set the bot's state to 'awaitingFirstName'
    ctx.session.state = "awaitingFirstName";
  } else {
    // Reply with an error message if the chat is not authorized
    ctx.reply("Unauthorized access.");
  }
});

alumni_bot.command("addImage", (ctx) => {
  ctx.session = {};

  if (isChatAuthorized(ctx.chat.id)) {
    ctx.reply("Welcome!\n\nPlease enter the community's graduation year::");
    ctx.session.state = "awaitingCommunityGraduationYear";
    // Set the bot's state to 'awaitingFirstName'
  } else {
    ctx.reply("Unauthorized access.");
  }
});

alumni_bot.on("text", async (ctx) => {
  // Check if the chat ID is authorized
  //isChatAuthorized(ctx.chat.id)
  if (ctx.session && ctx.session.state) {
    const state = ctx.session.state;
    const message = ctx.message.text;

    switch (state) {
      case "awaitingFirstName":
        if (isValidFirstName(message)) {
          ctx.session.firstName = message;
          ctx.reply("Please enter your last name:");
          ctx.session.state = "awaitingLastName";
        } else {
          ctx.reply("Please enter a valid first name:");
        }
        break;
      case "awaitingLastName":
        if (isValidLastName(message)) {
          ctx.session.lastName = message;
          ctx.reply("Please send me your image:");
          ctx.session.state = "awaitingImage";
        } else {
          ctx.reply("Please enter a valid last name:");
        }
        break;
      case "awaitingGraduateYear":
        const graduateYear = parseInt(message);
        if (isValidGraduateYear(graduateYear)) {
          const userDetails = {
            firstName: ctx.session.firstName,
            lastName: ctx.session.lastName,
            graduateYear: graduateYear,
          };
          const confirmationMessage = generateConfirmationMessage(userDetails);

          await ctx.replyWithPhoto(ctx.session.imageFileId, {
            caption: confirmationMessage,
          });

          ctx
            .replyWithPoll("Do you approve?", ["Approve ✔", "Disapprove ❌"], {
              is_anonymous: false,
              open_period: 300,
            })
            .then(async (pollMessage) => {
              const poll = new Poll({
                pollType:0,
                fName: userDetails.firstName,
                lName: userDetails.lastName,
                gradYear: userDetails.graduateYear,
                creatorID: ctx.from.id,
                imageID: ctx.session.imageFileId,
                pollID: pollMessage.poll.id,
              });

              const requestOptions = {
                method: "POST",
                uri: "http://137.184.74.25:3000/poll", // Update the URL to your server's endpoint
                body: poll,
                json: true,
                headers: {
                  Authorization: process.env.POST_POLL_API_KEY, // Replace with your API key
                },
              };

              //Make request with poll body
              try {
                await request(requestOptions, (error, response, body) => {
                  if (error) {
                    console.error("Error making the POST request:", error);
                  } else {
                    console.log(body); // Log the response body from your server
                    ctx.session.state = "";
                  }
                });
              } catch (error) {
                console.error("Error making the POST request:", error);
              }
              // Clear the session state
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          ctx.reply("Please enter a valid graduate year:");
        }
        break;
      case "awaitingCommunityGraduationYear":
        const communityGraduationYear = parseInt(message);
        if (isValidGraduateYear(communityGraduationYear)) {
          ctx.session.communityGraduationYear = communityGraduationYear;
          ctx.session.state = "waitingGradCommunityImage";
          ctx.reply("Please send an image!");
        } else {
          ctx.reply("Grad year is wrong or not supported!");
        }
        break;
      case "waitingGradCommunityImage":
        break;
    }
  } else {
    //ctx.reply("Unauthorized access.");
  }
});

alumni_bot.on("photo", async (ctx) => {
  if (isChatAuthorized(ctx.chat.id) && ctx.session) {
    const state = ctx.session.state;
    console.log("state: " + state);
    if (state === "awaitingImage") {
      // Validate the image
      if (await isValidImage(ctx, 200000)) {
        // Max size: 200KB
        const imageFileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        // Store the image file ID in the session
        ctx.session.imageFileId = imageFileId;

        ctx.reply("Please enter your graduate year:");
        ctx.session.state = "awaitingGraduateYear";
      } else {
        ctx.reply("The image is invalid. Currently, we cannot support large files. Use a telegram profile image please.");
      }
    } else if (state === "waitingGradCommunityImage") {

      if (await isValidCommunityImage(ctx, 3000000)) {
        console.log("here image passed")
        const imageFileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        const gradYear = parseInt(ctx.session.communityGraduationYear);
        console.log(ctx.message.from);
        console.log(session.communityGraduationYear);
        console.log(imageFileId);
        


        const poll = new Poll({
          pollType:1,
          fName: userDetails.firstName,
          lName: userDetails.lastName,
          gradYear: Number(session.communityGraduationYear),
          creatorID: ctx.from.id,
          imageID: ctx.session.imageFileId,
          pollID: pollMessage.poll.id,
        });



        const imageCaption = `Image for the year ${gradYear}`;
        await ctx.telegram.sendPhoto(authorizedChatIds[1], imageFileId, imageCaption);

        const pollQuestion = `Do you approve this image for the year ${gradYear}?`;
        const pollOptions = ["Yes", "No"];

        const pollMessage = await ctx.telegram.sendPoll(
          authorizedChatIds[1],
          pollQuestion,
          pollOptions,
          {
            is_anonymous: false, // Change to true if you want the poll to be anonymous
            allows_multiple_answers: false,
            open_period: 300
          }
        );
      }
    }
  } else {
    ctx.reply("Unauthorized access.");
  }
});


alumni_bot.on("poll_answer", async (ctx) => {
  const pollId = ctx.update.poll_answer.poll_id;

  const user = ctx.update.poll_answer.user;
  const chosenOption = ctx.update.poll_answer.option_ids[0];
  if (isUserInGroup(user)) {
    const requestOptions = {
      method: "POST",
      uri: "http://localhost:3000/update-poll", // UPDATE URL FOR
      body: { pollId: pollId, option: chosenOption },
      json: true,
      headers: {
        Authorization: process.env.POST_POLL_API_KEY, // Replace with your API key
      },
    };
    //Make request with poll option
    try {
      request(requestOptions, (error, response, body) => {
        if (error) {
          console.error("Error making the POST request:", error);
        } else {
          console.log(body); // Log the response body from your server
        }
      });
    } catch (error) {
      console.error("Error making the POST request:", error);
    }
  }
});

function handleCommunityImagePost() {}

function handleNewMemberPost() {}

function generateConfirmationMessage(userDetails) {
  const { firstName, lastName, graduateYear } = userDetails;
  return `First Name: ${firstName}
Last Name: ${lastName}
Graduate Year: ${graduateYear}
  `;
}

function isValidFirstName(firstName) {
  const regex = /^[A-Za-z]+$/;
  return regex.test(firstName);
}

function isValidLastName(lastName) {
  const regex = /^[A-Za-z]+$/;
  return regex.test(lastName);
}

function isValidGraduateYear(gradYear) {
  const regex = /^(201[7-9]|202[0-3])$/;
  return regex.test(gradYear);
}

async function isValidImage(ctx, maxSize) {
  const image = ctx.message.photo[ctx.message.photo.length - 1];
  const photoWidth = image.width;
  const photoHeight = image.height;
  const photoSize = image.file_size;
  const fileId = image.file_id;
  // Reality check

  if (photoSize < maxSize && Math.abs(photoWidth - photoHeight) < 10) {
    return true;
  }
  return false;
}


async function isValidCommunityImage(ctx, maxSize) {
  const image = ctx.message.photo[ctx.message.photo.length - 1];
  const photoSize = image.file_size;

  if (photoSize < maxSize) {
    return true;
  }
  return false;
}

// Authentication function
function isChatAuthorized(chatId) {
  //return authorizedChatIds.includes(chatId);
  return true;
}

function isUserInGroup(userID) {
  //Do smth
  return true;
}

module.exports = alumni_bot;
