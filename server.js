const { Configuration, OpenAIApi } = require("openai");
const TelegramBot = require('node-telegram-bot-api');
const { update } = require("tar");
const fs = require('fs');
require('dotenv').config();


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

ChatGPTTelegramBotToken = process.env.TELGERAM_BOT_TOKEN;
const ChatGPTTelegramBot = new TelegramBot(ChatGPTTelegramBotToken, {polling: true});

const adminChatId = process.env.ADMIN_ID;
const adminUsername = process.env.ADMIN_USERNAME;




let conversations = readConv();
let chatIDs = [];
conversations.forEach(conv => {
  chatIDs.push(conv.chatID);
});

ChatGPTTelegramBot.on('message', (msg) => {
  
  let cid = msg.chat.id;
  if (cid<0){
    let mmmmmsg = msg.text.toLowerCase();
    if (mmmmmsg.startsWith("bot") 
          || mmmmmsg.startsWith("ai") 
          || mmmmmsg.startsWith("meow")
          || mmmmmsg.startsWith("meowbot") 
          || mmmmmsg.startsWith("cat")
          || mmmmmsg.startsWith("bot")
          || mmmmmsg.startsWith("@bot") 
          || mmmmmsg.startsWith("@ai") 
          || mmmmmsg.startsWith("@meow")
          || mmmmmsg.startsWith("@meowbot") 
          || mmmmmsg.startsWith("@cat")
          || mmmmmsg.startsWith("@oaichatgptbot")
          ) {

      send(msg, ChatGPTTelegramBot, true);
      
    }
    return;
  }
  
  if (msg.text == undefined) {
    notifyAdminPhoto(msg, ChatGPTTelegramBot);
  } else {
    notifyAdmin(msg, ChatGPTTelegramBot);
  }
  
  
  conversations = readConv();
  conversations.forEach(conv => {
    chatIDs.push(conv.chatID);
  });
  if (!chatIDs.includes(msg.chat.id)) {
    chatIDs.push(msg.chat.id);
    const newConv = {
      chatID: msg.chat.id,
      tokens: 10,
      name: msg.chat.first_name + " " + msg.chat.last_name,
      username: msg.chat.username,
      description: msg.chat.description,
      photo: msg.chat.photo,
      phone: msg.chat.phone,
      blocked: false,
      banned: false,
      prompt: ""
    };
    conversations.push(newConv);
  }

  if (msg.chat.id==adminChatId){
    let msgTXT = msg.text+'';
    let indexOfSeparator = msgTXT.indexOf(' ');
    let command = msgTXT.slice(0, indexOfSeparator);
    let userID = msgTXT.substring(indexOfSeparator);
    console.log('ADMIN: ', 'Command: ', command, ', userID: ', userID);
    if(command == 'ban'){
      
      
      for (let index = 0; index < conversations.length; index++) {
        if (conversations[index].chatID == userID) {
          conversations[index].banned = true;
          updateConv();
          console.log(msg.chat.id, " got banned");
          //ChatGPTTelegramBot.sendMessage(Number(userID), 'You have been banned, for more info contact ' + adminUsername + '.');
          ChatGPTTelegramBot.sendMessage(adminChatId, 'You have banned ' + userID,  { parse_mode: 'Markdown' });
        }
        
      }
    }

    if(command == 'msg'){
      let indexOfSeparator2 = userID.indexOf('|');
      let uid = userID.slice(0, indexOfSeparator2);
      let msgCont = userID.slice(indexOfSeparator2+1);
      ChatGPTTelegramBot.sendMessage(Number(uid), msgCont);
      ChatGPTTelegramBot.sendMessage(adminChatId, 'You sent a message to ' + uid + ' | ' + msgCont,  { parse_mode: 'Markdown' });
      console.log(msg.chat.id, " messaged by admin | " + msgCont);
      
    }

    if(command == 'all'){
      let message = userID;
      conversations.forEach(cnv => {
        ChatGPTTelegramBot.sendMessage(cnv.chatID, message);
        cnv.tokens += 5;
        console.log(cnv.chatID, ' has been messaged by Admin: ', message);
      });
    }

    if(command == 'all'){
      let message = userID;
      conversations.forEach(cnv => {
        ChatGPTTelegramBot.sendMessage(cnv.chatID, message);
        cnv.tokens += 5;
        console.log(cnv.chatID, ' has been messaged by Admin: ', message);
      });
    }

    if(command == 'clear'){
      const prevLength = conversations.length;
      console.log('Clearing conversations: ' + prevLength);
    
      for (let i = 0; i < conversations.length; i++) {
        const conv1 = conversations[i];
        conv1.prompt = "";
        if (conv1.username == "borisdmitri") {
          delete conversations[i];
          console.log(conv1.chatID, ' deleted!');
        }
      }
      
      // Remove null and undefined elements
      const conversationsTemp = conversations.filter(element => {
        return element !== null && element !== undefined;
      });

      conversations = conversationsTemp;
      ChatGPTTelegramBot.sendMessage(adminChatId, '```All Conversations Cleared, Prev Length: ' + prevLength + ', Current Length: '+ conversations.length + '```',  { parse_mode: 'Markdown' });
    }

  } else {
      let cnvE = null;
      conversations.forEach(element => {
        if (element.chatID == msg.chat.id) {
          cnvE = element;
        }
      });
      if (!cnvE.banned){
        //console.log(msg.chat.id, msg.text);
        let tk = 0;
        //notifyAdmin(msg, ChatGPTTelegramBot);
        
        conversations.forEach(element => {
          if (element.chatID == msg.chat.id) {
            element.name = msg.chat.first_name + " " + msg.chat.last_name;
            element.username = msg.chat.username;
            element.description = msg.chat.description;
            element.photo =  msg.chat.photo;
            element.phone = msg.chat.phone;
            tk = element.tokens;
            
            // FREE Usage
            send(msg, ChatGPTTelegramBot, false);

            // Paid Usage
            /*
            if (tk > 0) {
              send(msg, ChatGPTTelegramBot);
            } else {
              ChatGPTTelegramBot.sendMessage(msg.chat.id, 'You are out of tokens! To recharge tokens, Please contact ' + adminUsername);
            }
            */
            
          }
        });
        
      } else {
        //ChatGPTTelegramBot.sendMessage(msg.chat.id, 'You are banned');
        //notifyAdmin(msg, ChatGPTTelegramBot);
        console.log(msg.chat.id, " *** banned *** : ", msg.text);
      }

      

  }

  
});

async function send(msg, bot, isGroup){
    try{
      sleep(1000);
      
      let cPrompt = "The following is a conversation with a Cat Bot AI assistant called MeowBot made by " + adminUsername 
      + ". MeowBot is helpful, creative, clever, very friendly and lovely, can talk and answer in all languages."
      + " it can also see see pictures, if MeowBot is told I love you then he says it back with more love."
      + " MeowBot always includes a Meow, "
      + " MeowBot always includes a kaomoji that is related to the answer, "
      + " MeowBot always includes an emoji that is related to the answer."
      + " MeowBot can not send or receive emails,"
      + " MeowBot does not talk about religions,"
      + " MeowBot says meow instead of ok or hey or hello,"
      + "\n\nHuman: Good morning"
      + "\nMeowBot: Meow, How can u help you ? 	٩(◕‿◕｡)۶";

      //get conversation
      let cConversation = null;
      let tk = 0;
      if (!isGroup) {
        conversations.forEach(conv => {
          if (conv.chatID == msg.chat.id) {
            cConversation = conv.prompt;
            conv.name = msg.chat.first_name + " " + msg.chat.last_name;
            conv.username = msg.chat.username;
            conv.description = msg.chat.description;
            conv.photo =  msg.chat.photo;
            conv.phone = msg.chat.phone;
            tk = conv.tokens;
          }
        });
      }
      
      
      cConversation += "\nHuman: " + msg.text + ".\nMeowBot: ";

      const response = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: cPrompt + cConversation,
          temperature: 0.9,
          max_tokens: 400,
          frequency_penalty: 0.0,
          presence_penalty: 0.6,
          stop: [" Human:", " MeowBot:"],
      });

      let answer = response.data.choices[0].text;

      cConversation += answer;
      
      if (!isGroup) {
        conversations.forEach(conv => {
          if (conv.chatID == msg.chat.id) {
            conv.prompt = cConversation;
            conv.tokens = conv.tokens-1;
            tk = conv.tokens;
          }
        });
      }
      

      bot.sendMessage(msg.chat.id,answer);
      //bot.sendMessage(msg.chat.id," Available Tokens: "+ tk );
       
      let ssdoii = msg.chat.id;
      if (msg.chat.username!=undefined) { ssdoii += " (" + msg.chat.username + ")"};
      ssdoii += " " + msg.chat.first_name;
      ssdoii = "``` re:" + ssdoii +  " :``` ";
      
      if (!isGroup) {
        bot.sendMessage(adminChatId,  ssdoii + answer,  { parse_mode: 'Markdown' });  
        console.log("Responded to: ", msg.chat.id, " ( Tokens: ", tk ,") : ", answer);
        updateConv();
      }
      
    } catch (error){
      sleep(10000);
      if (!(''+error).toLowerCase().includes('too many requests')) {
        console.log('Too many requests!');
      } else if((''+error).toLowerCase().includes('bad request')){
        clearConv(msg.chat.id);
        console.log('Bad Request!')
      } else {
        console.log(error);
      }
      bot.sendMessage(msg.chat.id,'I`m very sorry, something went wrong! can you please try again or notify my Developer: ' + adminUsername + '.');        
      
    }
}

function clearConv(id){
  for (let index = 0; index < conversations.length; index++) {
    const element = conversations[index];
    if (element.chatID == id) {
      delete conversations[index];
      break;
    }
  }
}

function updateConv(){
  let obj = {table: conversations};
  let oldCont = readConv().length;
  const jsonContent = JSON.stringify(obj);

  fs.writeFileSync("conversations/conversations.json", jsonContent); 
  console.log("File saved! containing: " + obj.table.length + " after containing: " + oldCont);
}

function readConv(){
  const obj = JSON.parse(fs.readFileSync('conversations/conversations.json', 'utf8'));
  
  // Remove null and undefined elements
  const conversations = obj.table.filter(element => {
    return element !== null && element !== undefined;
  });
  return conversations;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function notifyAdmin(msg, bot){
    
    let msgAdminContent =  msg.chat.id + "|";

        if (msg.chat.username != undefined) {
          msgAdminContent += '[' + msg.chat.username + '](tg://user?id=' + msg.chat.id+ ')';
        }
        if (msg.chat.username == undefined && msg.chat.first_name == undefined && msg.chat.last_name == undefined) {
          msgAdminContent += '[' + msg.chat.id + '](tg://user?id=' + msg.chat.id+ ')';
        }
        if (msg.chat.username == undefined && msg.chat.first_name != undefined && msg.chat.last_name == undefined) {
          msgAdminContent += '[' + msg.chat.first_name + '](tg://user?id=' + msg.chat.id+ ')';
        }
        if (msg.chat.username == undefined && msg.chat.first_name == undefined && msg.chat.last_name != undefined) {
          msgAdminContent += '[' + msg.chat.last_name + '](tg://user?id=' + msg.chat.id+ ')';
        }
        if (msg.chat.first_name != undefined && msg.chat.last_name != undefined) {
          if (msg.chat.username == undefined){
            msgAdminContent += '[' + msg.chat.first_name + ' ' + msg.chat.last_name + '](tg://user?id=' + msg.chat.id+ ') :';
          } else {
            msgAdminContent += ' (' + msg.chat.first_name + ' ' + msg.chat.last_name + '):';
          }
        } 
        else if (msg.chat.first_name != undefined && msg.chat.last_name == undefined) {
          msgAdminContent += ' (' + msg.chat.first_name + '):';
        }
        else if (msg.chat.first_name == undefined && msg.chat.last_name != undefined) {
          msgAdminContent += ' (' + msg.chat.last_name + '):';
        } else {
          msgAdminContent += '[x](tg://user?id=' + msg.chat.id + ':';
        }
        
        bot.sendMessage(adminChatId, msgAdminContent + "\n" + msg.text,  { parse_mode: 'Markdown' });
        msgAdminContent = msgAdminContent.replace('(tg://user?id=' + msg.chat.id +')','');
        console.log("\n", msgAdminContent + "\t\t" + msg.text);
}

function notifyAdminPhoto(msg, bot){
    
    let msgAdminContent =  msg.chat.id + "|";

        if (msg.chat.username != undefined) {
          msgAdminContent += '[' + msg.chat.username + '](tg://user?id=' + msg.chat.id+ ')';
        }
        if (msg.chat.username == undefined && msg.chat.first_name == undefined && msg.chat.last_name == undefined) {
          msgAdminContent += '[' + msg.chat.id + '](tg://user?id=' + msg.chat.id+ ')';
        }
        if (msg.chat.username == undefined && msg.chat.first_name != undefined && msg.chat.last_name == undefined) {
          msgAdminContent += '[' + msg.chat.first_name + '](tg://user?id=' + msg.chat.id+ ')';
        }
        if (msg.chat.username == undefined && msg.chat.first_name == undefined && msg.chat.last_name != undefined) {
          msgAdminContent += '[' + msg.chat.last_name + '](tg://user?id=' + msg.chat.id+ ')';
        }
        if (msg.chat.first_name != undefined && msg.chat.last_name != undefined) {
          if (msg.chat.username == undefined){
            msgAdminContent += '[' + msg.chat.first_name + ' ' + msg.chat.last_name + '](tg://user?id=' + msg.chat.id+ ') :\n';
          } else {
            msgAdminContent += ' (' + msg.chat.first_name + ' ' + msg.chat.last_name + '):';
          }
        } 
        else if (msg.chat.first_name != undefined && msg.chat.last_name == undefined) {
          msgAdminContent += ' (' + msg.chat.first_name + '):';
        }
        else if (msg.chat.first_name == undefined && msg.chat.last_name != undefined) {
          msgAdminContent += ' (' + msg.chat.last_name + '):';
        } else {
          msgAdminContent += '[x](tg://user?id=' + msg.chat.id + ':';
        }
        bot.sendMessage(adminChatId, msgAdminContent + ": Sent a Photo",  { parse_mode: 'Markdown' });
        if (msg.photo[2].file_id != undefined) {
          try {
             bot.sendPhoto(adminChatId, msg.photo[2].file_id);
          } catch (error) {
            bot.sendPhoto(adminChatId, msg.photo[1].file_id);
          }
        } else {
          bot.sendPhoto(adminChatId, msg.photo[1].file_id);
        }
        msgAdminContent = msgAdminContent.replace('(tg://user?id=' + msg.chat.id +')','');
        console.log("\n", msgAdminContent + "\t\t" + msg.photo[1].file_id);
}