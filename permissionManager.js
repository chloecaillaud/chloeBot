const { PermissionFlagsBits, PermissionsBitField } = require('discord.js');

/**
 * 
 * @param {Interaction} interaction
 * @param {PermissionsBitField} commandPermissions
 * @returns {bool | undefined} true if sucess, undefined if not evaluatable
 */
async function ensurePermissionsForCommand(interaction, commandPermissions)
{
	if(!interaction.isCommand()) {return undefined;}
	if(!interaction.inGuild())   {return true;}

	let requiredPermissions = makePermissionsExplicit(commandPermissions);
	let availablePermissions = interaction.channel.permissionsFor(interaction.client.user);

	if(availablePermissions.has(requiredPermissions)) {return true;}

	//if does not have all req, notify user of missing permissions
	//note: missing() returns array names of permissions, not bitfields
	const missingPermissions = availablePermissions.missing(requiredPermissions);
	messageContent = 'Missing permissions:\n - ' + missingPermissions.join('\n - ');
	
	throw new Error('Missing permissions', {cause: {fancyMessage: messageContent, ignore: false}});
}

/**
 * modifies a PermissionsBitField to include those the current set is dependent on
 * 
 * (ie: 'sendMessages' requires 'viewChannel')
 * @param {PermissionsBitField} perms
 * @returns
 */
function makePermissionsExplicit(perms)
{
	//define implicit permissions
	//text channel
	const DEPENDENCIES_LIST =
	[
		READ_MESSAGE_HISTORY =
		{
			permission: 
				PermissionFlagsBits.ReadMessageHistory
			,requirements:
				PermissionFlagsBits.ViewChannel
		}
		,SEND_MESSAGES =
		{
			permission:
				PermissionFlagsBits.SendMessages
			,requirements:
				PermissionFlagsBits.ViewChannel
		}
		,MENTION_EVERYONE =
		{
			permission:
				PermissionFlagsBits.MentionEveryone
			,requirements:
				PermissionFlagsBits.SendMessages
				| SEND_MESSAGES.requirements
		}
		,ADD_REACTIONS =
		{
			permission:
				PermissionFlagsBits.AddReactions
			,requirements:
				PermissionFlagsBits.ReadMessageHistory
				| READ_MESSAGE_HISTORY.requirements
		}
		,ATTACH_FILES =
		{
			permission:
				PermissionFlagsBits.AttachFiles
			,requirements:
				PermissionFlagsBits.SendMessages
				| SEND_MESSAGES.requirements
		}
		,EMBED_LINKS =
		{
			permission:
				PermissionFlagsBits.EmbedLinks
			,requirements:
				PermissionFlagsBits.SendMessages
				| SEND_MESSAGES.requirements
		}
		,USE_APPLICATION_COMMANDS =
		{
			permission:
				PermissionFlagsBits.UseApplicationCommands
			,requirements:
				PermissionFlagsBits.ViewChannel
		}
		,SEND_TTS_MESSAGES =
		{
			permission:
				PermissionFlagsBits.SendTTSMessages
			,requirements:
				PermissionFlagsBits.SendMessages
				| SEND_MESSAGES.requirements
		}
		,SEND_VOICE_MESSAGES =
		{
			permission:
				PermissionFlagsBits.SendVoiceMessages
			,requirements:
				PermissionFlagsBits.SendMessages
				| SEND_MESSAGES.requirements
		}

		//voice channel (extends text chann.)
		,CONNECT =
		{
			permission:
				PermissionFlagsBits.Connect
			,requirements:
				PermissionFlagsBits.ViewChannel
		}
		,SPEAK =
		{
			permission:
				PermissionFlagsBits.Speak
			,requirements:
				PermissionFlagsBits.Connect
				| CONNECT.requirements
		}
		,USE_VAD =
		{
			permission:
				PermissionFlagsBits.UseVAD
			,requirements:
				PermissionFlagsBits.Speak
				| SPEAK.requirements
		}
		,STREAM =
		{
			permission:
				PermissionFlagsBits.Stream
			,requirements:
				PermissionFlagsBits.Connect
				| CONNECT.requirements
		}
		,USE_SOUNDBOARD =
		{
			permission:
				PermissionFlagsBits.UseSoundboard
			,requirements:
				PermissionFlagsBits.Connect
				| CONNECT.requirements
		}
		,PRIORITY_SPEAKER =
		{
			permission:
				PermissionFlagsBits.PrioritySpeaker
			,requirements:
				PermissionFlagsBits.Speak
				| SPEAK.requirements
		}
		,USE_EMBEDDED_ACTIVITIES =
		{
			permission:
				PermissionFlagsBits.UseEmbeddedActivities
			,requirements:
				PermissionFlagsBits.Connect
				| CONNECT.requirements
		}
		,MUTE_MEMBERS =
		{
			permission:
				PermissionFlagsBits.MuteMembers
			,requirements:
				PermissionFlagsBits.Connect
				| CONNECT.requirements
		}
		,DEAFEN_MEMBERS =
		{
			permission:
				PermissionFlagsBits.DeafenMembers
			,requirements:
				PermissionFlagsBits.Connect
				| CONNECT.requirements
		}
		
		//threads (extends text chann.)
		,CREATE_PUBLIC_THREADS =
		{
			permission:
				PermissionFlagsBits.CreatePublicThreads
			,requirements:
				PermissionFlagsBits.ReadMessageHistory
				| READ_MESSAGE_HISTORY.requirements
		}
		,CREATE_PRIVATE_THREADS =
		{
			permission:
				PermissionFlagsBits.CreatePrivateThreads
			,requirements:
				PermissionFlagsBits.ReadMessageHistory
				| READ_MESSAGE_HISTORY.requirements
		}
		,SEND_MESSAGES_IN_THREADS =
		{
			permission:
				PermissionFlagsBits.SendMessagesInThreads
			,requirements:
				PermissionFlagsBits.ViewChannel
		}

		//guild managment
		,MANAGE_CHANNELS =
		{
			permission:
				PermissionFlagsBits.ManageChannels
			,requirements:
				PermissionFlagsBits.ViewChannel
		}
		,MANAGE_MESSAGES =
		{
			permission:
				PermissionFlagsBits.ManageMessages
			,requirements:
				PermissionFlagsBits.ReadMessageHistory
				| READ_MESSAGE_HISTORY.requirements
		}
		,MANAGE_THREADS =
		{
			permission:
				PermissionFlagsBits.ManageThreads
			,requirements:
				PermissionFlagsBits.ViewChannel
		}

		//member managment
		,MOVE_MEMBERS =
		{
			permission:
				PermissionFlagsBits.MoveMembers
			,requirements:
				PermissionFlagsBits.ViewChannel
		}
		,MANAGE_NICKNAMES =
		{
			permission:
				PermissionFlagsBits.ManageNicknames
			,requirements:
				PermissionFlagsBits.ChangeNickname
		}
	];

	//add the dependencies
	for(dependency of DEPENDENCIES_LIST)
	{
		if((perms & dependency.permission) == dependency.permission)
		{
			perms |= dependency.requirements;
		}
	}
	return perms;
}

/**
 * reply to a interaction regardless of replied/deffered status
 * @param {Interaction} interaction
 * @param {string} content
 * @returns {Promise<Message>}
 */
async function sendReply(interaction, content)
{
	let msg;
	if (interaction.replied || interaction.deferred)
	{
		msg = interaction.followup(content);
	}
	else
	{
		msg = interaction.reply(content);
	}
	return msg;
}
//-------------------------------------------------------------------------------------

module.exports =
{
	ensurePermissionsForCommand
}