const { handleGenericError } = require("../handleGenericError");

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
		
		return false;
	}
	catch (err)
	{
		handleGenericError(client, message, err, 'N-CI1');
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

		return false;

	}
	catch (err)
	{
		handleGenericError(client, message, err, 'N-CI2');
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

		if (!amount) {return 'Couldn\'t find find a number.'}
		if (amount === 0) {return 'I can\'t remove 0 messages, I mean technically..... Regardless, pick an actual number this time.'}
		if (amount < 0) {return 'I can\'t remove a negative amount of messages. Well, maybe if I try hard enough ......... nope sorry.'}
		if (amount > 99) {return 'I can only delete a maximum of 99 messages at a time, sorry.'}

		objParam.numbOfMsgs = amount;

		return false;

	}
	catch (err)
	{
		handleGenericError(client, message, err, 'NC-CI');
	}
};

//==============================================================

module.exports =
{
	collectNickTarget,
	collectNickName,
	collectNukeAmount,
};