const guildSettingsManager = require('./guildSettingsManager.js');
const { MessageFlags } = require('discord.js');
const fs = require('fs');

//=====================================================================================
// HANDLE ALL INCOMING MESSAGES
//=====================================================================================

function handleMessage(message)
{
	try
	{
		// early out if message not from user in a guild
		if
		(
			message.author.bot
			|| message.system
			|| !message.inGuild()
		)
		{return;}

		//match against any custom commands associated with the guild
		msgContent = message.content.trim();
		commandReply = guildSettingsManager.getCustomTextReply(message.guildId, msgContent);
		if(commandReply === undefined) {return;}

		message.reply({content: commandReply, flags: MessageFlags.SuppressNotifications ,allowedMentions: {parse: []}});
	}
	catch(err)
	{
		//ignore for now
		console.error(err);
	}
}

//-------------------------------------------------------------------------------------

exports.handleMessage = handleMessage;