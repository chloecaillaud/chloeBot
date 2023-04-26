const { SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags, ThreadAutoArchiveDuration } = require('discord.js');
const {handleInteractionError} = require('../handleInteractionErrors.js');
const guildSettingsManager = require('../guildSettingsManager.js');
const assert = require('assert');

//=====================================================================================

const COMMANDNAME = 'listcustomcommands';

//-------------------------------------------------------------------------------------
// build command data

const cmdData = new SlashCommandBuilder()
	.setName(COMMANDNAME)
	.setDescription('list all the custom commands for this server.')
	.setDMPermission(false)
	.addBooleanOption(option=>
		option
		.setName('plaintext')
		.setDescription('display the list as plain text (not prettified)')
		.setRequired(false)
		)
	;

//-------------------------------------------------------------------------------------
// code executed when slash command is called

async function executeSlashCommand(interaction)
{
	try
	{
		//create a message and attach a thread to send command list in (this is bypass the 2000 char limit, by sending 1 message per command)
		let threadChannelPromise = interaction.reply({content: 'see thread for list:', fetchReply: true})
			.then((message) => message.startThread({name: 'custom command list', autoArchiveDuration: ThreadAutoArchiveDuration.OneHour}));
		
		const isPlainText  = interaction.options.getBoolean('plaintext');
		const customCommands = guildSettingsManager.getCustomTextReplies(interaction.guild.id);

		const threadChannel = await threadChannelPromise;
		let messages = [];
		//send messages to thread asynchronously
		for(const [trigger, response] of Object.entries(customCommands))
		{
			let messagePayload = {content: '', embeds: [], allowedMentions: {parse: []}, flags: MessageFlags.SuppressNotifications};
			if(isPlainText)
			{
				messagePayload.content = `${trigger}\n \`\`\`${response}\`\`\`\n\u200B`;
			}
			else
			{
				const embed = new EmbedBuilder()
				.setColor(Colors.Blue)
				.setTitle(trigger)
				.setDescription(response)
				;

				messagePayload.embeds = [embed];
			}
			const messagePromise = threadChannel.send(messagePayload);
			messages.push(messagePromise);
		}
		//wait for all messages to be sent then lock and archive thread to prevent clutter/other users from sending messages in the thread
		await Promise.all(messages)
			.finally(() =>
			{
				return Promise.all
				([
					threadChannel.setLocked()
					,threadChannel.setArchived()
				]);
			});
	}
	catch(err)
	{
		handleInteractionError(interaction, err);
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