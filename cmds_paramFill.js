const { handleGenericError } = require("./handleGenericError");
const absPath = require('./absolutePaths.json');
const { prefix } = require('./config.json');


//==============================================================
// INITIAL PARAMETER FILLING
//==============================================================
//collect and check initial info, returns fail messages
function doClearNickCPF(client, message, args, objParam)
{
	try
	{
		if (!absPath.nickChannelsID.includes(message.channel.id)) {return 'I\'m not allowed to clear nicknames in this channel.'}
		if ((message.author.id === message.guild.ownerID)) {return 'I\'m sorry, I can\'t clear your nickname since you\'re the server owner.'}
	
		objParam.author.ID = message.author.id;
		objParam.author.name = message.author.username;
		objParam.author.isOwner = (message.author.id === message.guild.ownerID);
		objParam.channelHasPerms = (absPath.nickChannelsID.includes(message.channel.id));
	
		return 'pass';

	}
	catch (err)
	{
		handleGenericError(client, message, err, 'CPF-CN');
		return false;
	}
};

//--------------------------------------------------------------
function doNickCPF(client, message, args, objParam)
{
	try
	{
		let nickname;

		nickname = args.slice(1).join(' ');

		if (!absPath.nickChannelsID.includes(message.channel.id)) {return 'I\'m not allowed to set nicknames in this channel.'}

		if (args.length <= 1) {return `Invalid syntax, proper use ex: ${prefix}nick ${client.user.toString()} a nickname.`}

		if (!message.mentions.users.first()) {return 'Hmm, I couldn\'t find that user, sorry.'}
		if (message.mentions.users.length > 1) {return 'I can only set the nickname for one person at a time.'}
		if (message.mentions.users.first().id === message.guild.ownerID) {return 'I can\'t set the server owner\'s nickname, sorry.'}

		if (!nickname) {return `You didn't precise a nickname`}
		if (nickname.length > 32) {return 'I can\'t set nicknames longer than 32 characters, sorry.'}

		objParam.author.ID = message.author.id;
		objParam.author.name = message.author.username;
		objParam.channelHasPerms = (absPath.nickChannelsID.includes(message.channel.id));

		objParam.target.ID = message.mentions.users.first().id;
		objParam.target.name = message.mentions.users.first().username;
		objParam.target.isSelf = (objParam.target.ID === objParam.author.ID);

		objParam.nickname = nickname;

		return 'pass';
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'CPF-N');
		return false;
	}
};

//--------------------------------------------------------------
function doNukeChannCPF(client, message, args, objParam)
{
	try
	{
		let amount;

		amount = parseInt(args[0]);

		if (!message.member.roles.cache.some(role => absPath.nukePermRolesID.includes(role.id))) {return 'Looks like you don\'t have permission to nuke channels.'}

		if (!amount) {return 'Couldn\'t find find a number.'}
		if (amount === 0) {return 'I can\'t remove 0 messages, I mean technically..... Regardless, pick an actual number next time.'}
		if (amount < 0) {return 'I can\'t remove a negative amount of messages. Well, maybe if I try hard enough ......... nope sorry.'}
		if (amount > 99) {return 'I can only delete a maximum of 99 messages at a time, sorry.'}

		objParam.authorHasPerms = (message.member.roles.cache.some(role => absPath.nukePermRolesID.includes(role.id)));

		objParam.numbOfMsgs = amount;

		return 'pass';
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'CFP-NC');
		return false;
	}
};

//--------------------------------------------------------------
async function doIniSupportCPF(client, message, args, objParam)
{
	try
	{
		supServer = await client.guilds.fetch(absPath.supportServerID);

		objParam.supportServerObj = supServer;
		objParam.supportChannel.name = message.author.id;
		objParam.supportChannel.description = message.author.username + '_' + message.author.discriminator;
		objParam.supportChannel.exists = (supServer.channels.cache.some(chan => chan.name == message.author.id));

		return 'pass';
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'CPF-IS');
		return false;
	}
};

//--------------------------------------------------------------
function doMsgSearchCPF(client, message, args, objParam)
{
	try
	{
		let authorFilteredChannList;
		let clientFilteredChannList;
		let rawChannelList;
		let authorMember;
		let clientMember;

		if (!args.length || args.length < 2) {return `Invalid syntax, proper use **ex:** ${prefix}search keyword ${message.channel.toString()} blah blah.\n use **/help** for more info`}

		if (!!message.mentions.channels.first()) {objParam.specifiesChannels = true}
		
		objParam.searchType = args[0].toLowerCase();

		switch (objParam.searchType)
		{
			case 'exact':
				objParam.keywords = args.filter(x => !!x && !x.startsWith('<#')).slice(1).join(' ').trim().toLowerCase(); 
				break;
			case 'keyword':
				objParam.keywords = args.filter(x => !!x && !x.startsWith('<#')).slice(1).map(x => x.toLowerCase());
				break;
			case 'fuzzy':
				objParam.keywords = args.filter(x => !!x && !x.startsWith('<#')).slice(1).map(x => x.toLowerCase());
				break;
			default:
				return 'Sorry that\'s not a valid search type.\n valid tpyes: `exact | keyword | fuzzy`\nUse **/help** for more info.';
		}

		if (!objParam.keywords.length) {return `You didn't precise anything to search.`}

		if (!objParam.specifiesChannels) {rawChannelList = message.guild.channels.cache.filter(chann => chann.type === "text")}
		else {rawChannelList = message.mentions.channels.filter(chann => chann.type === "text")}

		if (rawChannelList.size === 0) {return 'Hmmm, seems I couldn\'t find the channel(s)'}

		authorMember = message.guild.member(message.author);
		authorFilteredChannList = rawChannelList.filter(chann => chann.permissionsFor(authorMember).has(['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'], true));

		if (authorFilteredChannList.size === 0) {return 'You do not have permissions to view any of those channels.'};

		clientMember = message.guild.member(client.user);
		clientFilteredChannList = authorFilteredChannList.filter(chann => chann.permissionsFor(clientMember).has(['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'], true));

		if (clientFilteredChannList.size === 0) {return 'I do not have permissions to view any of those channels.'};

		objParam.searchChannels = clientFilteredChannList.filter(chann => !absPath.searchBlacklist.includes(chann.id));

		return 'pass';
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'CPF-MS');
		return false;
	}
};

//==============================================================
function doUptimeCPF(client, message, args, objParam)
{
	try
	{
		let elapsed;

		elapsed = client.uptime;

		objParam.seconds = Math.floor((elapsed / 1000) % 60);
		objParam.minutes = Math.floor((elapsed / (1000 * 60)) % 60);
		objParam.hours = Math.floor((elapsed / (1000 * 60 * 60)) % 24);
		objParam.days = Math.floor(elapsed / (1000 * 60 * 60 * 24));

		return 'pass';
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'CPF-UT');
		return false;
	}
};

module.exports =
{
	doClearNickCPF,
	doNickCPF,
	doNukeChannCPF,
	doIniSupportCPF,
	doMsgSearchCPF,
	doUptimeCPF,
};