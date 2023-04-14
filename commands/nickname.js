const { SlashCommandBuilder } = require('discord.js');

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
				executeSubcmdSet(interaction);
				break;
			case 'clear':
				executeSubcmdClear(interaction);
				break;
			default:
				await interaction.reply('shits fucked');
		}
	}
	catch(err)
	{
		//last catch
		console.error(err)
	}
}

// subcommands
async function executeSubcmdSet(interaction)
{
	const targetMember = interaction.options.getMember('user');
	const newUsername = interaction.options.getString('nickname');

	//early out if the target has higher privilages than the bot
	//and therefor not modifyable
	if(!targetMember.manageable)
	{
		interaction.reply({ content: `unable to change ${targetMember.displayName}\'s name due to their elevated privilages.`, ephemeral: true });
		return;
	}
	//TODO filter nickname through profanity filter

	//TODO add channel filtering

	targetMember.setNickname(newUsername, `requested by ${interaction.user.username}`);

	//reply
	if(interaction.user.equals(targetMember.user))
	{
		interaction.reply(`${interaction.user.username} set their nickname to ${newUsername}.`);
	}
	else
	{
		interaction.reply(`${interaction.user.username} set ${targetMember.user.username}\'s nickname to ${newUsername}.`);
	}
}

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
	//TODO filter nickname through profanity filter

	//TODO add channel filtering

	targetMember.setNickname(null, `requested by ${interaction.user.username}`);

	//reply
	if(interaction.user.equals(targetMember.user))
	{
		await interaction.reply(`${interaction.user.username} cleared their nickname.`);
	}
	else
	{
		await interaction.reply(`${interaction.user.username} cleared ${targetMember.user.username}\'s nickname.`);
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