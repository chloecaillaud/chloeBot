const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

//=====================================================================================

const COMMANDNAME = 'boo';

//-------------------------------------------------------------------------------------
// build command data

const cmdData = new SlashCommandBuilder()
	.setName(COMMANDNAME)
	.setDescription('scares choebot !TEST!')
	.setDMPermission(true)
	;

//-------------------------------------------------------------------------------------
// code executed when slash command is called

async function executeSlashCommand(interaction)
{
	//console.log(interaction)
	//await interaction.reply('AHHH!');

	const exampleEmbed = new EmbedBuilder()
	//.setColor(0x359553) green
	//.setColor(0xF47174) red
	.setColor(0x0099FF)
	.setDescription('Added custom command:')
	.addFields({ name: '-stinky', value: 'no, you\'re stinky :P '});

	interaction.reply({ embeds: [exampleEmbed] });
}

//-------------------------------------------------------------------------------------
//prep command data for uploading
const rawCmdData = cmdData.toJSON();

//export abstracted data
module.exports =
{
	COMMANDNAME
	,rawCmdData
	,executeSlashCommand
}