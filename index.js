const { handleMessage } = require("./handleMessage");
const {token} = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client();
//--------------------------------------------------------------
// check that the bot works
client.once('ready', () => 
{
	console.log('Ready!');
});

//--------------------------------------------------------------
//what to run when recieve command
client.on('message', message => handleMessage(client, message));

client.login(token);