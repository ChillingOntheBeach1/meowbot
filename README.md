![MeowBot](https://i.imgur.com/Na3poBw.png)
# MeowBot 
MeowBot is an AI cat chatting bot developed using Node.js and the GPT-3 API. It is designed to engage in natural conversations with users and provide companionship and entertainment. In addition, MeowBot has a variety of commands and features that allow users to practice coding and solve challenges, making it a useful tool for learning and improving your skills.
You can try it with messaging [MeowBot](https://t.me/oaichatgptbot) on telegram.


## Installation

To install MeowBot, follow these steps:
 1.  Clone this repository to your local system:

    git clone https://github.com/dinoelhadj/meowbot.git

 2.  Navigate to the root directory of the repository:

    cd meowbot

 3.  Install the dependencies:

    npm install


## Configuration
Before you can use MeowBot, you will need to set up a few configuration options.
Rename the `.env.example` file to `.env` and fill in the values for the following variables:

    OPENAI_API_KEY =
    TELGERAM_BOT_TOKEN=
    ADMIN_ID=  your telegram ID
    ADMIN_USERNAME = your telegram username
## Usage
To start MeowBot, run the following command:
`npm start`
You can interact with MeowBot by sending it messages.
### Admin features
Admin will receive all messages sent to the bot and can also sends commands to the bot as following:

 1. `clear`: clears all conversations from messages in file conversations.json. 
example:		`clear /`
 2. `all`: Sends a message to everyone.
example:  `all Good Morning!!`
 3. `ban`: bans a user by ID. 
example: `ban 4567485`
 4. `msg`: messages a user by ID.
example: `msg 4567485 Heyyy, Hru ?`

## Contributing

If you are interested in contributing to MeowBot, please fork this repository and create a pull request with your changes.
