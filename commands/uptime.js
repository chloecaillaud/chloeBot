const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

//=====================================================================================

const COMMANDNAME = 'uptime';

//-------------------------------------------------------------------------------------
// build command data

const cmdData = new SlashCommandBuilder()
	.setName(COMMANDNAME)
	.setDescription('get this bots uptime.')
	.setDMPermission(true)
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	;

//-------------------------------------------------------------------------------------
// code executed when slash command is called

async function executeSlashCommand(interaction)
{
	try
	{
		//get the time since the bot's last 'ready' event
		const uptime = interaction.client.uptime

		const seconds = Math.floor((uptime / 1000) % 60);
		const minutes = Math.floor((uptime / (1000 * 60)) % 60);
		const hours   = Math.floor((uptime / (1000 * 60 * 60)) % 24);
		const days    = Math.floor( uptime / (1000 * 60 * 60 * 24));

		interaction.reply({ content: `uptime: ${days}d, ${hours}h, ${minutes}m, ${seconds}s`, ephemeral: true })
		.catch(err =>
			{
				//TODO replace with error handler
				console.error(err);
				interaction.reply({content: 'sorry, something went wrong.', ephemeral: true});
			});

	}
	catch(err)
	{
		//last catch
		console.error(err)
	}
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