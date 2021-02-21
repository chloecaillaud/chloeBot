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
	
		return false;

	}
	catch (err)
	{
		handleGenericError(client, message, err, 'CPF-CN');
	}
};

//--------------------------------------------------------------
function doNickCPF(client, message, args, objParam)
{
	try
	{
		let nickname;

		console.log(args);
		console.log(args.slice(1).join(' '));

		nickname = args.slice(1).join(' ');

		if (!absPath.nickChannelsID.includes(message.channel.id)) {return 'I\'m not allowed to set nicknames in this channel.'}

		if (args.length <= 1) {return `invalid syntax, proper use ex: ${prefix}nick <@${client.user.id}> a nickname`}

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

		return false;
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'CPF-N');
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

		return false;
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'CFP-NC');
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

		return false;
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'CPF-IS');
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
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'CPF-UT');
	}
}

module.exports =
{
	doClearNickCPF,
	doNickCPF,
	doNukeChannCPF,
	doIniSupportCPF,
};