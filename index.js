const { handleInteraction } = require("./handleInteraction");
const { handleMessage } = require("./handleMessage");
const {TOKEN} = require('./config.json');
const { Events, GatewayIntentBits } = require('discord.js');
const Discord = require('discord.js');

//--------------------------------------------------------------

//set of message ids to ignore interaction from
const interactionFilter = new Set();

const client = new Discord.Client({ intents:
	[
		GatewayIntentBits.Guilds
		,GatewayIntentBits.GuildMessages
		,GatewayIntentBits.MessageContent
		,GatewayIntentBits.GuildIntegrations
		,GatewayIntentBits.DirectMessages
	]});

//--------------------------------------------------------------
// check that the bot works

client.once(Events.ClientReady, () => 
{
	console.log('Ready!');
});

//--------------------------------------------------------------
//run on events

client.on(Events.InteractionCreate, interaction => handleInteraction(interaction, interactionFilter));
client.on(Events.MessageCreate, message => handleMessage(message));

client.login(TOKEN);