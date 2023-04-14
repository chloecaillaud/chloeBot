const fs = require('fs');
const {TOKEN, CLIENT_ID} = require('./config.json');
const { REST, Routes } = require('discord.js');

async function updateCommands()
{
	//get an array of all existing commands from the 'commands' folder
	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
	const commandDataArray = [];
	
	for(file of commandFiles)
	{
		let command = require(`./commands/${file}`);
		commandDataArray.push(command.rawCmdData);
	}

	//prepare REST module to upload commands
	const rest = new REST({version: '10'}).setToken(TOKEN);


	try
	{
		console.log('begin updating commands')

		await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commandDataArray });

		console.log('successfully updated commands');
	}
	catch(error)
	{
		console.error(error);
	}

};

updateCommands();