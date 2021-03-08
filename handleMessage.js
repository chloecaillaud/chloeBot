const interactLogic = require('./interactive/interactive_handleMsgs');
const { handleGenericError } = require("./handleGenericError");
const absPath = require('./absolutePaths.json');
const { prefix } = require('./config.json');
const cmds = require("./commands");

//=====================================================================================
// HANDLE ALL INCOMING MESSAGES
//=====================================================================================
async function handleMessage(client, message) 
{
 	const args = message.content.slice(prefix.length).trim().split(' ');
	const command = args.shift().toLowerCase();

	try
	{
		if (message.author.bot) return;
		else if (!!message.guild)
		{
			if (message.content.startsWith(prefix))
			{
				switch (command)
				{
					case 'help':
						cmds.doHelpCmd(client, message, args, false);
						break;
					case 'clearnick':
						cmds.doClearNickCmd(client, message, args);
						break;
					case 'nick':
						cmds.doNickCmd(client, message, args);
						break;
					case 'nukechannel':
						cmds.doNukeChannCmd(client, message, args);
						break;
					case 'badbot':
						cmds.doBadBotCmd(client, message, args);
						break;
					case 'support':
						cmds.doIniSupportCmd(client, message, args);
						break;
					case 'talk':
						interactLogic.doInteractiveCmd(client, message);
						break;
					case 'uptime':
						cmds.doUptimeCmd(client, message, args);
						break;
					default:
						message.channel.send(`${command} is not a supported command try **cb!help**`);
				}
			}
			else if (message.mentions.has(client.user) && !message.mentions.everyone)
			{
				interactLogic.doInteractiveCmd(client, message, args);
			}
			else if (message.channel.parentID === absPath.supportChannelCategory)
			{
				cmds.doReplyFromSupport(client, message, args);
			}
			else if (absPath.gamesCodeChannelID.includes(message.channel.id))
			{
				cmds.doCleanGC(client, message, args);
			}
		}
		else if (!message.guild)
		{
			if (message.content.startsWith(prefix))
			{
				switch (command)
				{
					case 'help':
						cmds.doHelpCmd(client, message, args, true);
						break;
					case 'support':
						cmds.doIniSupportCmd(client, message, args);
						break;
					case 'close':
						cmds.doCloseSupportCmd(client, message, args);
						break;
					default:
						message.channel.send(`${command} is not a supported command, try **cb!help**.`);
				}
			}

			else
			{
				cmds.doForwardToSupport(client, message);
			}
		}

	}
	catch (err)
	{
		handleGenericError(client, message, err, 'HM');
	}
};

exports.handleMessage = handleMessage;
