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
		return false;
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
		return false;
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
		return false;
	}
};

//--------------------------------------------------------------
function doMsgSearchCM(client, message, convo)
{
	try
	{
		let stringedKeywords;
		let channList;
		let objParam;

		objParam = convo.selCmdObj.parameters;

		if (Array.isArray(objParam.keywords)) {stringedKeywords = objParam.keywords.join(' ')}
		else {stringedKeywords = objParam.keywords}

		if (!!objParam.specifiesChannels) {channList = objParam.searchChannels.map(x => x.toString()).join(' ')}
		else {channList = 'all channels'}

		console.log(channList);
		convo.selCmdObj.interConfMsg = `\n__**search for:**__ ${stringedKeywords}\n__**search type:**__ ${objParam.searchType}\n__**In:**__ ${channList}`;

	}
	catch (err)
	{
		handleGenericError(client, message, err, 'MS-CM');
		return false;
	}
};

//==============================================================

module.exports =
{
	doClearNickCM,
	doNickCM,
	doNukeCM,
	doMsgSearchCM,
};