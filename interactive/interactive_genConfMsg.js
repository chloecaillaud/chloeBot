const { handleGenericError } = require("../handleGenericError");

//==============================================================
// GENERATE CONFIRMATION MESSAGE FOR INTERACTIVE CONVO
//==============================================================
function doClearNickCM(client, message, convo)
{
	try
	{
		let objParam;

		objParam = convo.selCmdObj.parameters;

		convo.selCmdObj.interConfMsg = `clear your nickname`;

	}
	catch (err)
	{
		handleGenericError(client, message, err, 'CN-CM');
	}
};

//--------------------------------------------------------------
function doNickCM(client, message, convo)
{
	try
	{
		let objParam;

		objParam = convo.selCmdObj.parameters;

		if (objParam.target.isSelf)
		{
			convo.selCmdObj.interConfMsg = `set your nickname to ${objParam.nickname}`;
		}
		else
		{
			convo.selCmdObj.interConfMsg = `set the nickname for ${objParam.target.name} to ${objParam.nickname}`;
		}

	}
	catch (err)
	{
		handleGenericError(client, message, err, 'N-CM');
	}
};

//--------------------------------------------------------------
function doNukeCM(client, message, convo)
{
	try
	{
		let objParam;

		objParam = convo.selCmdObj.parameters;

		convo.selCmdObj.interConfMsg = `clear the last ${objParam.numbOfMsgs} messages from this channel`;

	}
	catch (err)
	{
		handleGenericError(client, message, err, 'NC-CM');
	}
};

//--------------------------------------------------------------
function doBadBotCM(client, message, convo)
{
	try
	{
		convo.selCmdObj.interConfMsg = `remove the last fredboat message`;

	}
	catch (err)
	{
		handleGenericError(client, message, err, 'BB-CM');
	}
};

//--------------------------------------------------------------
async function doSupportCM(client, message, convo)
{
	try
	{
		let objParam;

		objParam = convo.selCmdObj.parameters;

		convo.selCmdObj.interConfMsg = `open a support chat for ${client.user.username}`;


	}
	catch (err)
	{
		handleGenericError(client, message, err, 'S-CM');
	}
};

//==============================================================

module.exports =
{
	doClearNickCM,
	doNickCM,
	doNukeCM,
	doBadBotCM,
	doSupportCM,
};