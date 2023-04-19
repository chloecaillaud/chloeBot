const { SlashCommandBuilder } = require('discord.js');
const {handleInteractionError} = require('../handleInteractionErrors.js');

//=====================================================================================

const COMMANDNAME = 'nickname';

//-------------------------------------------------------------------------------------
// build command data

const cmdData = new SlashCommandBuilder()
	.setName(COMMANDNAME)
	.setDescription('modify the nickname of a user on this server.')
	.setDMPermission(false)
	.addSubcommand(subcmd =>
		subcmd
		.setName('set')
		.setDescription('set a user\'s nickname.')
		.addUserOption(option =>
			option
			.setName('user')
			.setDescription('the user who\'s name will be changed.')
			.setRequired(true)
			)
		.addStringOption(option=>
			option
			.setName('nickname')
			.setDescription('the new nickname to assign to the user.')
			.setRequired(true)
			)
		)
	.addSubcommand(subcmd =>
		subcmd
		.setName('clear')
		.setDescription('clear a user\'s nickname.')
		.addUserOption(option =>
			option
			.setName('user')
			.setDescription('the user who\'s name will be cleared.')
			.setRequired(true)
			)
		)
	;

//-------------------------------------------------------------------------------------
// code executed when slash command is called

async function executeSlashCommand(interaction)
{
	try
	{
		switch(interaction.options.getSubcommand())
		{
			case 'set':
				await executeSubcmdSet(interaction);
				break;
			case 'clear':
				await executeSubcmdClear(interaction);
				break;
			default:
				throw new Error('invalidComponent', {cause: {fancyMessage: 'Invalid subcommand: unknown subcommand.', ignore: false}});
		}
	}
	catch(err)
	{
		handleInteractionError(interaction, err);
	}
}

//--------------------
//set subcommand

async function executeSubcmdSet(interaction)
{
	const targetMember = interaction.options.getMember('user');
	const newUsername = interaction.options.getString('nickname');

	//early out if the target has higher privilages than the bot
	//and therefor not modifyable
	if(!targetMember.manageable)
	{
		await interaction.reply({ content: `unable to change ${targetMember.displayName}\'s name due to their elevated privilages.`, ephemeral: true });
		return;
	}
	
	await targetMember.setNickname(newUsername, `Username set by ${interaction.user.username}`);
	
	replyMsg = interaction.user.id === targetMember.id ? `${interaction.user.username} set their nickname to ${newUsername}.` : `${interaction.user.username} set ${targetMember.user.username}\'s nickname to ${newUsername}.`;
	await interaction.reply(replyMsg);
}

//--------------------
//clear subcommand

async function executeSubcmdClear(interaction)
{
	const targetMember = interaction.options.getMember('user');

	//early out if the target has higher privilages than the bot
	//and therefor not modifyable
	if(!targetMember.manageable)
	{
		await interaction.reply({ content: `unable to change ${targetMember.displayName}\'s name due to their elevated privilages.`, ephemeral: true });
		return;
	}

	await targetMember.setNickname(null, `Username set by ${interaction.user.username}`);

	replyMsg = interaction.user.id === targetMember.id ? `${interaction.user.username} cleared their nickname.` : `${interaction.user.username} cleared ${targetMember.user.username}\'s nickname.`
	await interaction.reply(replyMsg);
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