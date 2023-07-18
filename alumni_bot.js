// JShint esversion: 6
const { Telegraf, session } = require("telegraf");
const request = require("request");
const e = require("express");

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
          console.log(quoteData);
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
          console.log(factData);
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
alumni_bot.command("addalumnus", (ctx) => {
  ctx.session ??= {};
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

alumni_bot.on("text", async (ctx) => {
  console.log(ctx);
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
          await ctx.replyWithPoll(
            "Do you approve?",
            ["Approve ✔", "Disapprove ❌"],
            { is_anonymous: false }
          );
          ctx.session.state = "awaitingApproval";
          console.log(ctx.session);
        } else {
          ctx.reply("Please enter a valid graduate year:");
        }
        break;
    }
  } else {
    //ctx.reply("Unauthorized access.");
  }
});

alumni_bot.on("photo", async (ctx) => {
  if (isChatAuthorized(ctx.chat.id) && ctx.session) {
    const state = ctx.session.state;
    if (state === "awaitingImage") {
      // Validate the image
      if (await isValidImage(ctx, 200000)) {
        // Max size: 200KB
        const imageFileId =
          ctx.message.photo[ctx.message.photo.length - 1].file_id;
        // Store the image file ID in the session
        ctx.session.imageFileId = imageFileId;
        console.log(ctx.session.imageFileId);

        ctx.reply("Please enter your graduate year:");
        ctx.session.state = "awaitingGraduateYear";
      } else {
        ctx.reply(
          "The image is invalid. Currently, we cannot support large files. Use a telegram profile image please."
        );
      }
    } else {
      // Do nothing
    }
  } else {
    //ctx.reply("Unauthorized access.");
  }
});

alumni_bot.on("poll_answer", async (ctx) => {
  console.log(ctx);
  /*
  ctx.session.pollResults ??= { 0: 0, 1: 0 }; // Initialize poll results

  const user = ctx.update.poll_answer.user;
  const chosenOptions = ctx.update.poll_answer.option_ids;

  // Increment the count for the chosen option
  for (let option of chosenOptions) {
    ctx.session.pollResults[option]++;
  }

  const totalVotes =
    ctx.session.pollResults["0"] + ctx.session.pollResults["1"];

  if (totalVotes >= 11) {
    // If at least 11 answers have been received, determine the majority
    let result;
    if (ctx.session.pollResults["0"] > ctx.session.pollResults["1"]) {
      result = "The majority approved.";
      ctx.session = "";
    } else {
      result = "The majority disapproved.";
      ctx.session = "";
    }

    ctx.reply(result);
    // Clear poll results
    ctx.session.pollResults = { 0: 0, 1: 0 };
  }
  console.log(ctx.session.pollResults);
  */
});

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
  const regex = /^(201[7-9]|202[0-1])$/;
  return regex.test(gradYear);
}

async function isValidImage(ctx, maxSize) {
  console.log("here", ctx.message.photo);
  const image = ctx.message.photo[ctx.message.photo.length - 1];
  const photoWidth = image.width;
  const photoHeight = image.height;
  const photoSize = image.file_size;
  const fileId = image.file_id;
  // Reality check
  if (photoSize < maxSize && Math.abs(photoWidth - photoHeight) < 10) {
    console.log(photoWidth, photoHeight, photoSize, fileId);
    return true;
  }
  return false;
  ctx.message.photo[ctx.message.photo.length - 1];
}

// Authentication function
function isChatAuthorized(chatId) {
  return authorizedChatIds.includes(chatId);
}

module.exports = alumni_bot;
