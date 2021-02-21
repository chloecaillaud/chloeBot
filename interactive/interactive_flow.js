
const collectInputs = require("./interactive_collectInputs");
const paramFill = require("./interactive_paramFill");
const confMsg = require("./interactive_genConfMsg");
const exeCmds = require("../executeCmds");
const cmdObjs = require("../cmdObjs");


const interactiveCmdsFlow =
{
	openingMsg: () => 'what did you need?',
	cmds: () => [clearnickCmdFlow, nickCmdFlow, nukechannelCmdFlow],
};

const clearnickCmdFlow =
{
	name: 'clearnick',
	description: 'clear your nickname',
	linkedCmdObj: cmdObjs.clearNickObj,
	paramFillFnc: paramFill.doClearNickIPF,
	confMsgFnc: confMsg.doClearNickCM,
	executeFnc: exeCmds.exeClearNickCmd,
	steps:
	[
		{
			userMustInc: ['nick', 'name', 'title', 'call', 'title'],
			userMustInc1: ['remove', 'clear', 'take off', 'revoke', 'take away', 'rid', 'strip', 'remove', 'discard'],
			userMustNotInc: ['set', 'change', 'adjust', 'diffrent', 'modify'],
			ignoreAltCmdsCheck: false,
		},
	],
};

const nickCmdFlow =
{
	name: 'nick',
	description: 'set someone\'s nickname',
	linkedCmdObj: cmdObjs.nickObj,
	paramFillFnc: paramFill.doNickIPF,
	confMsgFnc: confMsg.doNickCM,
	executeFnc: exeCmds.exeNickCmd,
	steps:
	[
		{
			userMustInc: ['nick', 'name', 'title', 'call', 'title'],
			userMustNotInc: ['remove', 'clear', 'take off', 'revoke', 'take away', 'rid', 'strip', 'remove', 'discard'],
			ignoreAltCmdsCheck: false,
		},
		{
			question: () => 'please tag the person you want to set the nickname for?\n(please use @ mention)',
			stepColFnc: collectInputs.collectNickTarget,
			ignoreAltCmdsCheck: false,
			helpMsg: (client, message) => `\`Use @ to mention the person you want to add a nickname to.\`\n(ex: <@${client.user.id}>)\n Can\'t be server owner.\nOnly one person.`,
		},
		{
			question: () => 'what do you want to set their nickname to?',
			stepColFnc: collectInputs.collectNickName,
			ignoreAltCmdsCheck: true,
		},
	],
};

const nukechannelCmdFlow =
{
	name: 'nukechannel',
	description: 'clear messages from this channel',
	linkedCmdObj: cmdObjs.nukeChannelObj,
	paramFillFnc: paramFill.doNukeIPF,
	confMsgFnc: confMsg.doNukeCM,
	executeFnc: exeCmds.exeNukeChannCmd,
	steps:
	[
		{
			userMustInc: ['nuke','remove', 'clear', 'take away', 'rid', 'strip', 'remove', 'discard', 'void', 'clean', 'empty'],
			userMustInc1: ['channel', 'chat', 'room', 'message', 'group'],
			userMustNotInc: ['nick', 'name', 'title', 'call'],
			ignoreAltCmdsCheck: false,
		},
		{
			question: () => 'how many messages do you want me to remove?\n(max: 99)',
			stepColFnc: collectInputs.collectNukeAmount,
			ignoreAltCmdsCheck: false,
			helpMsg: (client, message) =>'\`Type the number of messages you want to clear\`\n(ex: 64)\nMust be between 1 and 99.\nCan\'t be a spelt out number.',
		},
	],
};

//-------------------------------------------------------------------------------------

const intHelpCmdFlow =
{
	name: 'interactiveHelp',
	steps:
	[
		{
			userMustInc: ['idk', 'help', 'i don\'t know', 'i dont know', 'confused', 'wtf', 'assist'],
			userMustNotInc: [],
		},
	],
};

const stopFlow =
{
	name: 'stop',
	steps:
	[
		{
			userMustInc: ['stop', 'end', 'terminate', 'break', 'halt', 'cancel', 'nvm', 'never mind', 'nevermind', 'close'],
			userMustNotInc: [],
		},
	],
};

const confCmdFlow =
{
	helpMsg: (client, message) => 'Look I cant relly help you here, it\'s a simple yes or no question.',
	answers:
	[
		{
			userMustInc: ['sure', 'ok', 'yah', 'aye', 'ye', 'absolutly', 'mhm'],
			userMustNotInc: ['no', 'never', 'nah', 'refuse', 'decline', 'negative'],
		},
		{
			userMustInc: ['no', 'never', 'nah', 'refuse', 'decline', 'negative'],
			userMustNotInc: ['sure', 'ok', 'yah', 'aye', 'ye', 'absolutly', 'mhm'],
		},
		{
			userMustInc: ['no', 'never', 'nah', 'refuse', 'decline', 'negative'],
			userMustNotInc: ['sure', 'ok', 'yah', 'aye', 'ye', 'absolutly', 'mhm'],
		},
	],
};

//-------------------------------------------------------------------------------------
module.exports = 
{
	interactiveCmdsFlow,
	clearnickCmdFlow,
	nickCmdFlow,
	nukechannelCmdFlow,
	intHelpCmdFlow,
	stopFlow,
	confCmdFlow,
};