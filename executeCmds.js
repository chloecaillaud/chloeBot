const { handleGenericError } = require("./handleGenericError");
const imbeddedMessages = require('./imbeddedMessages.js');
const absPath = require('./absolutePaths.json');
const Discord = require('discord.js');

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
async function exeMsgSearchCmd(client, message, objParam)
{
	try
	{
		let currentChannelNumb;
		let pendingMsgContent;
		let currentChannel;
		let maxChannelNumb;
		let filteredCont;
		let pendingMsg;
		let result;

		maxChannelNumb = objParam.searchChannels.size;
		currentChannelNumb = 1;
		
		pendingMsgContent = genPendingMsg(client, message, objParam.maxIteration, 0, maxChannelNumb, 0);
		pendingMsg = await message.channel.send(pendingMsgContent);

		for (currentChannel of objParam.searchChannels)
		{
			result = await itrGetMsgs(client, message, objParam, currentChannel, maxChannelNumb, currentChannelNumb, pendingMsg);
			if (!result) {return false}
			if (!!result && result.pass === true) {break}

			currentChannelNumb ++;
		}

		if (!result) {return {outputText: 'something went wrong', timeout: false}}
		else if (result.pass === false)
		{
			await pendingMsg.delete();

			return {outputText: 'Could not find any matching messages, sorry.', timeout: false}
		}
		else if (result.pass === true)
		{
			filteredCont = Discord.Util.cleanContent(result.matchingMsg.content, result.matchingMsg);

			await pendingMsg.delete();
			return {outputText: `${result.matchingMsg.url}\nquoted from: ${result.matchingMsg.author.username}\n>>> ${filteredCont}`, timeout: false}
		}
		return {outputText: 'done', timeout: false};
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'EXE-MS');
	}
};

//```````````````````````````````````````````````````````````````
async function itrGetMsgs(client, message, objParam, currentChannel, maxChannelNumb, currentChannelNumb, pendingMsg)
{
	try
	{
		let pendingMsgContent;
		let fetchedMessages;
		let currentFetchItr;
		let lastMessage;
		let match;

		currentFetchItr = 1;

		fetchedMessages = await currentChannel[1].messages.fetch({ limit: 100 });

		match = checkMsgMatch(client, message, objParam, fetchedMessages);
		if (!match) {return false}
		else if (match.pass === true) {return match}

		pendingMsgContent = genPendingMsg(client, message, objParam.maxIteration, currentFetchItr, maxChannelNumb, currentChannelNumb);
		pendingMsg = await pendingMsg.edit(pendingMsgContent);
		
		while (currentFetchItr < objParam.maxIteration)
		{
			if (!fetchedMessages.last()) {break}
			lastMessage = fetchedMessages.last().id;

			fetchedMessages = await currentChannel[1].messages.fetch({ limit: 100, before: lastMessage});

			match = checkMsgMatch(client, message, objParam, fetchedMessages);
			if (!match) {return false}
			else if (match.pass === true) {return match}
			
			currentFetchItr ++;

			pendingMsgContent = genPendingMsg(client, message, objParam.maxIteration, currentFetchItr, maxChannelNumb, currentChannelNumb);
			pendingMsg = await pendingMsg.edit(pendingMsgContent);
		}

		return match;
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'EXE-MS-G');
		return false;
	}
};

//```````````````````````````````````````````````````````````````
function checkMsgMatch(client, message, objParam, fetchedMessages)
{
	try
	{
		let fetchedMsgCont;
		let failResult;
		let msg;

		failResult = {pass: false, matchingMsg: {}};

		for (msg of fetchedMessages)
		{
			if (!msg[1] || !msg[1].content) {return failResult}
			if (msg[1] == message || msg[1].author == client.user) {continue}
			fetchedMsgCont = msg[1].content.toLowerCase();

			switch (objParam.searchType)
			{
				case 'exact':
					if (fetchedMsgCont.includes(objParam.keywords)) {return {pass: true, matchingMsg: msg[1]}}
					break;
				case 'keyword':
					if (objParam.keywords.every(word => fetchedMsgCont.includes(word))) {return {pass: true, matchingMsg: msg[1]}}
					break;
				case 'fuzzy':
					if (objParam.keywords.every(word => fetchedMsgCont.includes(word))) {return {pass: true, matchingMsg: msg[1]}}
					break;
				default:
					throw 'error determining search type';
			}
		}

		return failResult;
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'EXE-MS-C');
		return false;
	}
};

//```````````````````````````````````````````````````````````````
function genPendingMsg(client, message, barMax, barCur, countMax, countCur)
{
	try
	{
		let countMsg;
		let baseMsg;
		let barMsg;
		let barPos;
		let bar = ['[', '░', '░', '░', '░', '░', '░', '░', '░', '░', '░', ']'];
		
		barPos = (barCur / barMax) * 10 + 1;
		barMsg = bar.fill('▓', 1, barPos).join('');
		
		baseMsg = 'Searching...\nThis may take take a little bit.';
		countMsg = `${countCur}/${countMax}`;

		return `${baseMsg}\n${barMsg} ${countMsg}`;
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'EXE-MS-P');
		return false;
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
	exeMsgSearchCmd,
	exeUptimeCmd,
};