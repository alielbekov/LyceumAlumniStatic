// JShint esversion: 6
const { Telegraf, session } = require("telegraf");
const request = require("request");

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
  if (isChatAuthorized(ctx.chat.id) || true) {
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

// Authentication function
function isChatAuthorized(chatId) {
  return authorizedChatIds.includes(chatId);
}
alumni_bot.on("text", (ctx) => {
  // Check if the chat ID is authorized
  if (isChatAuthorized(ctx.chat.id) || true) {
    const state = ctx.session.state;
    const message = ctx.message.text;

    switch (state) {
      case "awaitingFirstName":
        // Validate the first name
        if (isValidFirstName(message)) {
          // Store the first name in the session
          ctx.session.firstName = message;
          // Ask for the user's last name
          ctx.reply("Please enter your last name:");
          // Set the bot's state to 'awaitingLastName'
          ctx.session.state = "awaitingLastName";
        } else {
          // Ask the user to provide a valid first name
          ctx.reply("Please enter a valid first name:");
        }
        break;
      case "awaitingLastName":
        // Validate the last name
        if (isValidLastName(message)) {
          // Store the last name in the session
          ctx.session.lastName = message;
          // Ask for the user's image
          ctx.reply("Please send me your image:");
          // Set the bot's state to 'awaitingImage'
          ctx.session.state = "awaitingImage";
        } else {
          // Ask the user to provide a valid last name
          ctx.reply("Please enter a valid last name:");
        }
        break;
      case "awaitingImage":
        // Check if the message contains an image
        console.log("ctx");
        if (ctx.message.photo) {
          // Get the file ID of the largest photo
          const imageFileId =
            ctx.message.photo[ctx.message.photo.length - 1].file_id;
          // Store the image file ID in the session
          ctx.session.imageFileId = imageFileId;
          // Ask for the user's graduate year
          ctx.reply("Please enter your graduate year:");
          // Set the bot's state to 'awaitingGraduateYear'
          ctx.session.state = "awaitingGraduateYear";
        } else {
          // Ask the user to provide a valid image
          ctx.reply("Please send a valid image:");
        }
        break;
      case "awaitingGraduateYear":
        // Validate the graduate year
        const graduateYear = parseInt(message);
        if (isValidGraduateYear(graduateYear)) {
          // Perform the necessary validation and POST request to the API here
          // If successful, store the user object in MongoDB

          const userDetails = {
            firstName: ctx.session.firstName,
            lastName: ctx.session.lastName,
            graduateYear: graduateYear,
          };
          const confirmationMessage = generateConfirmationMessage(
            userDetails,
            ctx.session.imageFileId
          );

          // Send the confirmation message to the user
          ctx.replyWithMarkdown(confirmationMessage);

          // Reset the bot's state
          ctx.session.state = "";
        } else {
          // Ask the user to provide a valid graduate year
          ctx.reply("Please enter a valid graduate year:");
        }
        break;
    }
  } else {
    // Reply with an error message if the chat is not authorized
    ctx.reply("Unauthorized access.");
  }
});

function generateConfirmationMessage(userDetails, imageFileId) {
  const { firstName, lastName, graduateYear } = userDetails;
  const imageCaption = `Image: [Click here to view](${imageFileId})`;
  return `Confirmation:
  First Name: ${firstName}
  Last Name: ${lastName}
  Graduate Year: ${graduateYear}
  ${imageCaption}`;
}

function isValidFirstName(firstName) {
  return true;
}

function isValidLastName(lastName) {
  return true;
}

function isValidGraduateYear(gradYear) {
  return true;
}

module.exports = alumni_bot;
