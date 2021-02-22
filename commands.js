const { handleGenericError } = require("./handleGenericError");
const absPath = require('./absolutePaths.json');
const paramFill = require("./cmds_paramFill");
const exeCmds = require("./executeCmds");
const cmdObjs = require("./cmdObjs");


//==============================================================
// COMMANDS
//==============================================================

function doHelpCmd(client, message, args, isDM)
{
	try
	{
		let objParam = {};
		let reply;
		
		Object.assign(objParam, objParam = cmdObjs.helpObj.parameters);

		objParam.isDM = isDM;
		
		reply = exeCmds.exeHelpCmd(client, message, objParam);

		sendReply(client, message, reply);
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'C-H');
	}
};
//--------------------------------------------------------------
async function doClearNickCmd(client, message, args)
{
	try
	{
		let objParam = {};
		let reply;

		Object.assign(objParam, objParam = cmdObjs.clearNickObj.parameters);

		failMsg = paramFill.doClearNickCPF(client, message, args, objParam);

		if (!failMsg) reply = await exeCmds.exeClearNickCmd(client, message, objParam);
		else reply = {outputText: failMsg, timeout: 5000};

		sendReply(client, message, reply);
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'C-CN');
	}
}

//--------------------------------------------------------------
async function doNickCmd(client, message, args)
{
	try
	{
		let objParam = {};
		let reply;

		Object.assign(objParam, objParam = cmdObjs.nickObj.parameters);

		failMsg = paramFill.doNickCPF(client, message, args, objParam);

		if (!failMsg) reply = await exeCmds.exeNickCmd(client, message, objParam);
		else reply = {outputText: failMsg, timeout: 5000};

		sendReply(client, message, reply);
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'C-N');
	}

}

//--------------------------------------------------------------
async function doNukeChannCmd(client, message, args)
{
	try
	{
		let objParam = {};
		let reply;
		
		Object.assign(objParam, objParam = cmdObjs.nukeChannelObj.parameters);

		failMsg = paramFill.doNukeChannCPF(client, message, args, objParam);

		if (!failMsg) reply = await exeCmds.exeNukeChannCmd(client, message, objParam);
		else reply = {outputText: failMsg, timeout: 5000};

		sendReply(client, message, reply);
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'C-NC');
	}
}

//--------------------------------------------------------------
async function doBadBotCmd(client, message, args)
{
	try
	{
		let objParam = {};
		let reply;

		reply = await exeCmds.exeBadBotCmd(client, message, objParam);

		sendReply(client, message, reply);
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'C-BB');
	}
}

//--------------------------------------------------------------
async function doIniSupportCmd(client, message, args)
{
	try
	{
		let objParam = {};
		let reply;

		Object.assign(objParam, objParam = cmdObjs.supportObj.parameters);

		failMsg = await paramFill.doIniSupportCPF(client, message, args, objParam);

		if (!failMsg) reply = exeCmds.exeIniSupportCmd(client, message, objParam);
		else reply = {outputText: failMsg, timeout: 5000};

		sendReply(client, message, reply);
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'C-IS');
	}
}

//--------------------------------------------------------------
function doCloseSupportCmd(client, message, args)
{
	try
	{
		console.log('close lmao');
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'C-CS');
	}
}

//--------------------------------------------------------------
function doUptimeCmd(client, message, args)
{
	try
	{
		let objParam = {};
		let reply;

		Object.assign(objParam, objParam = cmdObjs.uptimeObj.parameters);

		failMsg = paramFill.doUptimeCPF(client, message, args, objParam);

		if (!failMsg) reply = exeCmds.exeUptimeCmd(client, message, objParam);
		else reply = {outputText: failMsg, timeout: 5000};

		sendReply(client, message, reply);
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'C-UT');
	}
}

//==============================================================
//==============================================================
async function doCleanGC(client, message)
{
	try
	{
		let fetchedMessage;
		fetchedMessage = await message.channel.messages.fetch({ limit: 1, before: message.id });

		fetchedMessage.first().delete({timeout: 500});
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'C-GC');
	}
}

//--------------------------------------------------------------
// forward messages from dm to support
async function doForwardToSupport(client, message)
{
	try
	{
		let msgChannel;
		let server;

		server = await client.guilds.fetch(absPath.supportServerID);
		msgChannel = server.channels.cache.find(chann => chann.name === message.author.id);

		if (!!msgChannel) {msgChannel.send(message.content)}
		else {message.author.send('you havn\'t started a support session try using **cb!support**')}

	}
	catch (err)
	{
		handleGenericError(client, message, err, 'C-FS');
	}
}

//--------------------------------------------------------------
// reply to messages from dm to support
function doReplyFromSupport(client, message)
{
	try
	{
		let msgUser;

		msgUser = client.users.cache.get(message.channel.name);
		msgUser.send(message.content);

	}
	catch (err)
	{
		handleGenericError(client, message, err, 'C-RS');
	}
}
//--------------------------------------------------------------
async function sendReply(client, message, reply)
{
	try
	{
		let closingMsg;

		closingMsg = await message.channel.send(reply.outputText);

		if (!!reply.timeout) {closingMsg.delete({timeout: reply.timeout})}

		message.delete();

	}
	catch (err)
	{
		handleGenericError(client, message, err, 'C-SR');
	}
}


module.exports =
{
	doHelpCmd,
	doClearNickCmd,
	doNickCmd,
	doNukeChannCmd,
	doBadBotCmd,
	doIniSupportCmd,
	doCloseSupportCmd,
	doUptimeCmd,
	doCleanGC,
	doForwardToSupport,
	doReplyFromSupport,
	sendReply,
};