// JShint esversion: 6
const { Telegraf } = require('telegraf')
const request = require('request');


// Change this array to include the chat IDs where you want your new bot to operate
const authorizedChatIds = [-1001948673440, -1001966916584]; 




// Change BOT_TOKEN to the token of your new bot
const alumni_bot = new Telegraf(process.env.ALUMNI_BOT_TOKEN);

alumni_bot.command('help', (ctx) => {
  // Check if the chat ID is authorized
  if (isChatAuthorized(ctx.chat.id)) {
    
    // Change this line if you want to send a different image or another response
    const rulesFilePath = __dirname+'/public/images/rules.png';
  
    // Send the 'rules.png' file as a reply
    ctx.replyWithPhoto({ source: rulesFilePath });
  } else {
    // Reply with an error message if the chat is not authorized
    ctx.reply('Unauthorized access.');
  }
});

alumni_bot.command('quote', (ctx) => {
    // Check if the chat ID is authorized
    if (isChatAuthorized(ctx.chat.id)) {
      const apiKey = (process.env.QUOTES_API_KEY);
  
      // Send a GET request to the API Ninja Quotes API
      request.get({
        url: `https://api.api-ninjas.com/v1/quotes?`,
        headers: {
          'X-Api-Key': apiKey
        }
      }, function (error, response, body) {
        if (error) {
          console.error('Request failed:', error);
          ctx.reply('Failed to fetch a quote. Please try again.');
        } else if (response.statusCode !== 200) {
          console.error('Error:', response.statusCode, body.toString('utf8'));
          ctx.reply('Failed to fetch a quote. Please try again.');
        } else {
          const quoteData = JSON.parse(body);
          console.log(quoteData);
          const quote = quoteData[Math.floor(Math.random() * quoteData.length)];
          ctx.reply(`"${quote.quote}" - ${quote.author}`);
        }
      });
    } else {
      // Reply with an error message if the chat is not authorized
      ctx.reply('Unauthorized access.');
    }
  });

  alumni_bot.command('fact', (ctx) => {
    // Check if the chat ID is authorized
    if (isChatAuthorized(ctx.chat.id)) {
      const apiKey = (process.env.QUOTES_API_KEY);
  
      // Send a GET request to the API Ninja Quotes API
      request.get({
        url: `https://api.api-ninjas.com/v1/facts?`,
        headers: {
          'X-Api-Key': apiKey
        }
      }, function (error, response, body) {
        if (error) {
          console.error('Request failed:', error);
          ctx.reply('Failed to fetch a quote. Please try again.');
        } else if (response.statusCode !== 200) {
          console.error('Error:', response.statusCode, body.toString('utf8'));
          ctx.reply('Failed to fetch a quote. Please try again.');
        } else {
          const factData = JSON.parse(body);
          console.log(factData);
          const fact = factData[Math.floor(Math.random() * factData.length)];
          ctx.reply(`"${fact.fact}" - api-ninja`);
        }
      });
    } else {
      // Reply with an error message if the chat is not authorized
      ctx.reply('Unauthorized access.');
    }
  });
  
// Authentication function
function isChatAuthorized(chatId) {
  return authorizedChatIds.includes(chatId);
}


module.exports = alumni_bot;
