const Discord = require('discord.js');
const { prefix, token} = require('./config.json');
const {gamesCodeChannelID, nickChannelID, fredboatID} = require('./absolutePaths.json');
const {errorList, supportMessage} = require('./lists.json');
const imbeddedMessages = require('./imbeddedMessages.js');

const client = new Discord.Client();

//--------------------------------------------------------------
// check that the bot works
client.once('ready', () => 
{
	console.log('Ready!');
});

//--------------------------------------------------------------
//what to run when recieve command
client.on('message', message => 
{
	const genericErrorMsg = errorList[Math.floor(Math.random() * errorList.length)];
	const args = message.content.slice(prefix.length).trim().split(' ');
	const command = args.shift().toLowerCase();

	try
	{
		if (message.author.bot) return;
		else if (message.content.startsWith(prefix))
		{
			switch(command)
			{
				case 'help':
					doHelpCommand();
					break;
				case 'clearnick':
					doClearNickCommand();
					break;
				case 'nick':
					doNickCommand();
					break;
				case 'nukechannel':
					doNukeChannel();
					break;
				case 'badbot':
					doBadBotCommand();
					break;
				case 'support':
					doSupportCommand();
					break;
				default:
					message.channel.send(`${command} is not a supported command try **cb!help**`);
			}
		}
		else if(gamesCodeChannelID.includes(message.channel.id))
		{
			doGameCodeChannelClean();
		}
	}
	catch(err)
	{
		handleGenericError(err, 'M0');
	}

//==============================================================
// MAIN COMMANDS
//==============================================================
//help command function
	async function doHelpCommand()
	{
		try
		{
			message.delete({timeout : 750});
			await message.channel.send({ embed: imbeddedMessages.helpMessage });
		}
		catch(err)
		{
			handleGenericError(err, 'M1');
		}
	}

//--------------------------------------------------------------
//clear nick command function
	async function doClearNickCommand()
	{
		try
		{
			let user = message.author.username;
			let userID = getuserID(user);
			let channelID = message.channel.id;
			let outputText;


		
			if(!nickChannelID.includes(channelID)) return;
			else if (userID === message.guild.ownerID)
			{
				outputText = 'you cannot set the nickname of the server owner';
			}
			else
			{
				await message.guild.members.cache.get(userID).setNickname('');

				message.delete({timeout : 750});
				outputText = `${user} cleared their nickname`;
			}

			message.channel.send(outputText);

		}
		catch(err)
		{
			handleGenericError(err, 'M2');
		}
	}

//--------------------------------------------------------------
//nick command function
	async function doNickCommand()
	{	
		try
		{
			let currentUser;
			let mentionedUser;
			let mentionedUserID;
			let nicknameArray;
			let nicknameString;
			let outputText;
			let channelID = message.channel.id;

			if (!args.length)													//error handling: check if syntax is correct
			{
				message.channel.send('use: cb!nick (@user) (nickname)');
			}
			else if(nickChannelID.includes(channelID))
			{	
				currentUser = message.author.username;
				mentionedUser = message.mentions.users.first();
				mentionedUserID = getID(mentionedUser);
				nicknameArray = args.slice(1);
				nicknameString = nicknameArray.join(' ');						//cut out user arg. and covert to 

				if (mentionedUserID === undefined)
				{
					outputText = 'could\'t find that user, make sure you are using @ mention';
				}
				else if (!message.mentions.has(mentionedUserID, {ignoreRoles : true, ignoreEveryone : true}))
				{
					outputText = 'must mention a single user';
				}
				else if (mentionedUserID === message.guild.ownerID)
				{
					outputText = 'you cannot set the nickname of the server owner';
					message.delete({timeout : 10000});
				}
				else
				{
					outputText = await setNick(currentUser, mentionedUserID, nicknameString);
					message.delete({timeout : 10000});
				}
				
				
			}
			else
			{
				outputText = 'sorry, you can\'t use that command in this channel';
			}
			

			message.channel.send(outputText);

		}
		catch(err)
		{
			handleGenericError(err, 'M3');
		}
		
	}

//--------------------------------------------------------------
// nukechannel command
	function doNukeChannel()
	{	
		try
		{
			let nukeAmount;
			let outputText;

			if(message.member.roles.cache.find(r => r.name === 'admin'))
			{
				if (args.length === 1)
					nukeAmount = parseInt(args[0]) + 1;
				else
					nukeAmount = 99;

				message.delete({timeout : 750});
				removeMessages(nukeAmount).then
				{
					outputText = 'channel cleared by admin';
				}
			}
			else
			{
				message.delete({timeout : 750});
				outputText = `you do not have permission to use the ${command} command`;
			}

			message.channel.send(outputText);


		}
		catch(err)
		{
			handleGenericError(err, 'M4');
		}
	}

//--------------------------------------------------------------
// remove last fredboat message command (extrernal)
	async function doBadBotCommand()
	{
		try
		{
			const maxSearchDepth = 25;

			let fetchedMessage;
			let filteredMessages;
			let messageID = message.id;
			let i = 0;

			do
			{
				fetchedMessage = await message.channel.messages.fetch({limit : 1, before : messageID});
				filteredMessages = fetchedMessage.find(msg => msg.author.id === fredboatID);
				messageID = fetchedMessage.last().id;

				i++
			}
			while(filteredMessages === undefined && i < maxSearchDepth);


			if(i < maxSearchDepth)
			{
				message.channel.bulkDelete(fetchedMessage, true);
			}
			else
			{
				message.channel.send('message is too far up or could not be found');
			}
		}
		catch(err)
		{
			handleGenericError(err, 'M5');
		}
	}

//--------------------------------------------------------------
// start support messaging command (extrernal)
	function doSupportCommand()
	{
		try
		{
			createsupportchannel();
			startDirrectMessaging();
		}
		catch(err)
		{
			handleGenericError(err, 'M6');
		}
	}

//==============================================================
// SUBORDINATE FUNCTIONS
//==============================================================
// set the nickname and return proper message
	async function setNick(user, targetUserID, nickname)
	{
		try
		{
			let userID = getuserID(user);
			let targetUser = await client.users.cache.get(targetUserID).username;

			if (!!targetUserID)
			{
				await message.guild.members.cache.get(targetUserID).setNickname(nickname);	//set the nickname

				if (userID == targetUserID)
				{
					return `${user} set their own nickname to ${nickname}`				//messages to return
				}
				else
				{
					return `${user} set the nickname for ${targetUser} to ${nickname}`
				}
			}
			else
			{
				return `${targetUser} is not a member on this server`
			}
		}
		catch(err)
		{
			handleGenericError(err, 'S1');
		}
	}

//--------------------------------------------------------------
// get user's ID from name for nick(internal)
function getuserID(name)
{
	try
	{
		const currentUser = client.users.cache.find(user => user.username === name);
		let userID;

		if (!!currentUser)
		{
			userID = currentUser.id;
		}

		return userID;
	}
	catch(err)
	{
		handleGenericError(err, 'S2');
	}
}

//--------------------------------------------------------------
// clean last game codes from the channel
	async function doGameCodeChannelClean()
	{
		try
		{
			let lastMessageID = message.id;
			let fetchedMessages = await message.channel.messages.fetch({limit : 1, before : lastMessageID});
			message.channel.bulkDelete(fetchedMessages, true);
		}
		catch(err)
		{
			handleGenericError(err, 'S3');
		}
	}

//--------------------------------------------------------------
// remove messages
	async function removeMessages(removeAmount)
	{
		try
		{
			let fetchedMessages = await message.channel.messages.fetch({limit : removeAmount});
			message.channel.bulkDelete(fetchedMessages, true);
		}
		catch(err)
		{
			handleGenericError(err, 'S4');
		}
	}

//--------------------------------------------------------------
// remove messages
	function createsupportchannel()
	{
		try
		{
			return
		}
		catch(err)
		{
			handleGenericError(err, 'S5');
		}
	}

//--------------------------------------------------------------
// remove messages
	function startDirrectMessaging()
	{
		try
		{
			message.author.send(supportMessage);
		}
		catch(err)
		{
			handleGenericError(err, 'S6');
		}
	}

//--------------------------------------------------------------
// get ID
	function getID(item)
	{
		let itemID;
		
		try
		{
			itemID = item.id;
		}
		catch(err)
		{
			itemID = undefined;
		}

		return itemID;
	}

//==============================================================
// ERROR HANNDLING
//==============================================================
// handle error generic errors
function handleGenericError(reportedError, arbitrFuncID)
{
	console.log(reportedError.name + '\n' + reportedError.message);
	message.channel.send(genericErrorMsg + `\n error ref code: ${arbitrFuncID}`);
	message.channel.send(reportedError.name + '\n' + reportedError.message);
}
});

client.login(token);