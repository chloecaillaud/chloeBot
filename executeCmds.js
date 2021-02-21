const { handleGenericError } = require("./handleGenericError");
const imbeddedMessages = require('./imbeddedMessages.js');
const absPath = require('./absolutePaths.json');

//==============================================================
// EXECUTE COMMANDS
//==============================================================
//execute commands, returns: message reply & message timout(false if no timeout)
function exeHelpCmd(client, message, objParam)
{
	try
	{
		if (objParam.isDM) {return {outputText: { embed: imbeddedMessages.helpMessageDM}, timeout: false}}
		else {return {outputText: { embed: imbeddedMessages.helpMessage}, timeout: false}}
//		({ embed: helpMsg })
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'EXE-H');
	}
};

//--------------------------------------------------------------
async function exeClearNickCmd(client, message, objParam)
{
	try
	{
		if (!objParam.channelHasPerms) {return {outputText: 'I can\'t clear nicknames in this channel, sorry.', timeout: 5000}}
		if (objParam.author.isOwner) {return {outputText: 'I can\'t clear the server owner\'s nickname, sorry.', timeout: 5000}}

		await message.guild.members.cache.get(objParam.author.ID).setNickname('');
		return {outputText: `Cleared ${objParam.author.name}\'s nickname.`, timeout: false};
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'EXE-CN');
	}
};

//--------------------------------------------------------------
async function exeNickCmd(client, message, objParam)
{
	try
	{
		console.log(message);
		console.log(objParam);

		if (!objParam.channelHasPerms) {return {outputText: 'I can\'t set nicknames in this channel, sorry.', timeout: 5000}}
		if (objParam.target.isOwner) {return {outputText: 'I can\'t set the server owner\'s nickname, sorry.', timeout: 5000}}

		await message.guild.members.cache.get(objParam.target.ID).setNickname(objParam.nickname);

		if (objParam.target.isSelf) {return {outputText: `${objParam.author.name} set their nickname to ${objParam.nickname}`, timeout: false}}
		else {return {outputText: `${objParam.author.name} set the nickname for ${objParam.target.name} to ${objParam.nickname}`, timeout: false}}
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'EXE-N');
	}

};

//--------------------------------------------------------------
async function exeNukeChannCmd(client, message, objParam)
{
	try
	{
		let fetchedMessages
		
		if (!objParam.authorHasPerms) {return {outputText: 'You don\'t have the permissions to use this command, sorry.', timeout: 5000}}

		fetchedMessages = await message.channel.messages.fetch({ limit: objParam.numbOfMsgs });
		message.channel.bulkDelete(fetchedMessages, true); // second value filters old msgs

		return {outputText: '--- *messages cleared.* ---', timeout: false};

	}
	catch (err)
	{
		handleGenericError(client, message, err, 'EXE-NC');
	}
};

//--------------------------------------------------------------
async function exeBadBotCmd(client, message, objParam)
{
	try
	{
		let fetchedMessages;
		let filteredMessage;

		if (!absPath.badBotChannsID.includes(message.channel.id)) {return {outputText: 'I can\'t do that in this channel.', timeout: 5000}}

		fetchedMessages = await message.channel.messages.fetch({ limit: 50});
		filteredMessage = fetchedMessages.find(msg => msg.author.bot && !!msg.embeds[0]);


		if (!filteredMessage) {return {outputText: 'Message is too far up or could not be found, sorry.', timeout: 5000}}

		filteredMessage.delete();

		return {outputText: `cleared an embeded message from ${filteredMessage.author.username}`, timeout: false};
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'EXE-BB');
	}
};

//--------------------------------------------------------------
function exeIniSupportCmd(client, message, objParam)
{
	try
	{
		if (objParam.supportChannel.alreadyExists) {return {outputText: 'A support session is already running, you can close it at any time by typing \`cb!close\`', timeout: false}}

		objParam.supportServerObj.channels.create(objParam.supportChannel.name, { parent: absPath.supportChannelCategory, topic: objParam.supportChannel.description});

		message.author.send({ embed: imbeddedMessages.supportMessage});
		return {outputText: 'Please check your DMs.', timeout: 30000};
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'EXE-IS');
	}
};

//--------------------------------------------------------------
function exeUptimeCmd(client, message, objParam)
{
	try
	{
		return {outputText: `\`uptime: ${objParam.days}d, ${objParam.hours}h, ${objParam.minutes}m, ${objParam.seconds}s\``, timeout: false};
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'exe-UT');
	}
};

module.exports =
{
	exeHelpCmd,
	exeClearNickCmd,
	exeNickCmd,
	exeNukeChannCmd,
	exeBadBotCmd,
	exeIniSupportCmd,
	exeUptimeCmd,
};