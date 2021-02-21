const { handleGenericError } = require("../handleGenericError");
const absPath = require('../absolutePaths.json');

//==============================================================
// INITIAL PARAMETER FILLING
//==============================================================
//collect and check initial info, returns fail messages
function doClearNickIPF(client, message, convo)
{
	try
	{
		let objParam;

		objParam = convo.selCmdObj.parameters;

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
		handleGenericError(client, message, err, 'CN-IPF');
	}
};

//--------------------------------------------------------------
function doNickIPF(client, message, convo)
{
	try
	{
		let objParam;

		objParam = convo.selCmdObj.parameters;

		if (!absPath.nickChannelsID.includes(message.channel.id)) {return 'I\'m not allowed to set nicknames in this channel.'}

		objParam.author.ID = message.author.id;
		objParam.author.name = message.author.username;
		objParam.channelHasPerms = (absPath.nickChannelsID.includes(message.channel.id));

		return false;
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'N-IPF');
	}
};

//--------------------------------------------------------------
function doNukeIPF(client, message, convo)
{
	try
	{
		let objParam;

		objParam = convo.selCmdObj.parameters;

		if (!message.member.roles.cache.some(role => absPath.nukePermRolesID.includes(role.id))) {return 'Looks like you don\'t have permission to nuke channels.'}

		objParam.authorHasPerms = (message.member.roles.cache.some(role => absPath.nukePermRolesID.includes(role.id)));

		return false;
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'NC-IPF');
	}
};

//--------------------------------------------------------------
function doBadBotIPF(client, message, convo)
{
	try
	{

	}
	catch (err)
	{
		handleGenericError(client, message, err, 'BB-IPF');
	}
};

//--------------------------------------------------------------
async function doSupportIPF(client, message, convo)
{
	try
	{
		let objParam;

		objParam = convo.selCmdObj.parameters;
		supServer = await client.guilds.fetch(absPath.supportServerID);

		objParam.supportServerObj = supServer;
		objParam.supportChannel.name = message.author.id;
		objParam.supportChannel.description = message.author.username + '_' + message.author.discriminator;
		objParam.supportChannel.exists = (supServer.channels.cache.some(chan => chan.name == message.author.id));

		return false;
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'S-IPF');
	}
};

//==============================================================

module.exports =
{
	doClearNickIPF,
	doNickIPF,
	doNukeIPF,
	doBadBotIPF,
	doSupportIPF,
};