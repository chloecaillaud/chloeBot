const helpObj =
{
	name: 'help',
	parameters: 
	{
		isDM: false,
	},
	interConfMsg: '',
};

const clearNickObj =
{
	name: 'clearNick',
	parameters:
	{
		author:
		{
			ID: 0,
			name: '',
			isOwner: false,
		},
		channelHasPerms: false,
	},
	interConfMsg: '',
};

const nickObj =
{
	name: 'nick',
	parameters:
	{
		author:
		{
			ID: 0,
			name: '',
		},
		target:
		{
			ID: 0,
			name: '',
			isOwner: false,
			isSelf: false,
		},
		nickname: '',
		channelHasPerms: false,
	},
	interConfMsg: '',
};

const nukeChannelObj =
{
	name: 'nukeChannel',
	parameters:
	{
		authorHasPerms: false,
		numbOfMsgs: 0,
	},
	interConfMsg: '',
};

const badBotObj =
{
	name: 'badBot',
	parameters: {},
	interConfMsg: '',
};

const supportObj =
{
	name: 'support',
	parameters: 
	{
		supportChannel:
		{
			name: '',
			description: '',
			alreadyExists: false,
		},
		supportServerObj: {},
	},
	interConfMsg: '',
};

const uptimeObj =
{
	name: 'uptime',
	parameters: 
	{
		seconds: 0,
		minutes: 0,
		hours: 0,
		days: 0,
	},
	interConfMsg: '',
};
module.exports = 
{
	helpObj,
	clearNickObj,
	nickObj,
	nukeChannelObj,
	badBotObj,
	supportObj,
	uptimeObj,
};