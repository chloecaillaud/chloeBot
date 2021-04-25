const { handleGenericError } = require("../handleGenericError");
const absPath = require('../absolutePaths.json');

//==============================================================
// CHECK AND COLLECT INPUTS FOR INTERACTIVE CONVO
//==============================================================
//collect and check inputs, returns fail messages

function collectNickTarget(client, message, convo)
{
	try
	{
		let objParam;

		objParam = convo.selCmdObj.parameters;

		if (!message.mentions.users.first()) {return 'Hmm, I couldn\'t find that user, sorry.'}
		if (message.mentions.users.length > 1) {return 'I can only set the nickname for one person at a time.'}
		if (message.mentions.users.first().id === message.guild.ownerID) {return 'I can\'t set the server owner\'s nickname, sorry.'}
		

		objParam.target.ID = message.mentions.users.first().id;
		objParam.target.name = message.mentions.users.first().username;
		objParam.target.isSelf = (objParam.target.ID === objParam.author.ID);
		
		return 'pass';
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'N-CI1');
		return false;
	}
};

function collectNickName(client, message, convo)
{
	try
	{
		let objParam;

		objParam = convo.selCmdObj.parameters;

		if (message.content.length > 32) {return 'I can\'t set nicknames longer than 32 characters, sorry.'}

		objParam.nickname = message.content;

		return 'pass';

	}
	catch (err)
	{
		handleGenericError(client, message, err, 'N-CI2');
		console.log('N-CI2');
		return false;
	}
};

//--------------------------------------------------------------
function collectNukeAmount(client, message, convo)
{
	try
	{
		let objParam;

		objParam = convo.selCmdObj.parameters;
		amount = parseInt(message.content);

		if (!amount) {return 'Couldn\'t find a number.'}
		if (amount === 0) {return 'I can\'t remove 0 messages, I mean technically..... Regardless, pick an actual number this time.'}
		if (amount < 0) {return 'I can\'t remove a negative amount of messages. Well, maybe if I try hard enough ......... nope sorry.'}
		if (amount > 99) {return 'I can only delete a maximum of 99 messages at a time, sorry.'}

		objParam.numbOfMsgs = amount;

		return 'pass';

	}
	catch (err)
	{
		handleGenericError(client, message, err, 'NC-CI');
		return false;
	}
};

//--------------------------------------------------------------
function collectMsgSearchType(client, message, convo)
{
	try
	{
		let objParam;
		let msgCont;

		objParam = convo.selCmdObj.parameters;

		msgCont = message.content.toLowerCase();

		switch (msgCont)
		{
			case 'exact':
				objParam.searchType = 'exact';
				break;
			case 'keyword':
				objParam.searchType = 'keyword';
				break;
			case 'fuzzy':
				objParam.searchType = 'fuzzy';
				break;
			default:
				return 'That doesn\'t match any of the search types i know, sorry.'

		}

		return 'pass';

	}
	catch (err)
	{
		handleGenericError(client, message, err, 'MS-CI1');
		return false;
	}
};

function collectMsgSearchChanns(client, message, convo)
{
	try
	{
		let authorFilteredChannList;
		let clientFilteredChannList;
		let authorMember;
		let clientMember;
		let objParam;


		objParam = convo.selCmdObj.parameters;

		if (!!message.mentions.channels.first()) {objParam.specifiesChannels = true}
		else if (message.content.toLowerCase().includes('all')) {objParam.specifiesChannels = false}
		else {return 'It seems like you didn\'t tag any channels or used **all**.'}

		if (!objParam.specifiesChannels) {rawChannelList = message.guild.channels.cache.filter(chann => chann.type === "text")}
		else {rawChannelList = message.mentions.channels.filter(chann => chann.type === "text")}

		if (rawChannelList.size === 0) {return 'Hmmm, seems I couldn\'t find the channel(s), please make sure they\'re text channels.'}

		authorMember = message.guild.member(message.author);
		authorFilteredChannList = rawChannelList.filter(chann => chann.permissionsFor(authorMember).has(['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'], true));

		if (authorFilteredChannList.size === 0) {return 'You do not have permissions to view any of those channels.'};

		clientMember = message.guild.member(client.user);
		clientFilteredChannList = authorFilteredChannList.filter(chann => chann.permissionsFor(clientMember).has(['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'], true));

		if (clientFilteredChannList.size === 0) {return 'I do not have permissions to view any of those channels.'};

		objParam.searchChannels = clientFilteredChannList.filter(chann => !absPath.searchBlacklist.includes(chann.id));

		return 'pass'
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'MS-CI2');
		return false;
	}
};

function collectMsgSearchKeywords(client, message, convo)
{
	try
	{
		let objParam;

		objParam = convo.selCmdObj.parameters;

		switch (objParam.searchType)
		{
			case 'exact':
				objParam.keywords = message.content.trim().toLowerCase();
				break;
			case 'keyword':
				objParam.keywords = message.content.trim().split(' ').filter(x => !!x).map(x => x.toLowerCase());
				break;
			case 'fuzzy':
				objParam.keywords = message.content.trim().split(' ').filter(x => !!x).map(x => x.toLowerCase());
				break;
			default:
				throw 'invalid searchType';
		}
		return 'pass';

	}
	catch (err)
	{
		handleGenericError(client, message, err, 'MS-CI3');
		return false;
	}
};
//==============================================================

module.exports =
{
	collectNickTarget,
	collectNickName,
	collectNukeAmount,
	collectMsgSearchType,
	collectMsgSearchChanns,
	collectMsgSearchKeywords,
};