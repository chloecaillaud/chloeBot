const helpMessage =
{
	color: 0x23272a,
	title: 'Help',
	description: '',
	fields:
	[
		{
			name: '\`cb!clearnick\`',
			value: 'Clear your nickname.\n\---',
			inline: false,
		},
		{
			name: '\`cb!nick @username nickname\`',
			value: 'Set the nickname of someone or yourself(if not specified).\n\---',
			inline: false,
		},
		{
			name: '\`cb!nukechannel amount\`',
			value: 'Clears an amount of messages from channel. max: 99.\n\---',
			inline: false,
		},
		{
			name: '\`cb!setup\`',
			value: '!work in prgress! Doesn\'t currently do anything.\n\---',
			inline: false,
		},
		{
			name: '\`cb!badbot\`',
			value: 'Removes last embeded message sent by a bot.\n\---',
			inline: false,
		},
		{
			name: '\`cb!support\`',
			value: 'Need extra help? ask the bot dirrectly.\n\---',
			inline: false,
		},
		{
			name: '\`cb!talk\`',
			value: 'Ask me what you want to do, I\'d be happy to help!\n**You can also just use <@!744783614046371841> instead.**\n\---',
			inline: false,
		},
		{
			name: '\`cb!search searchType #channel(s)(optional) keywords\`',
			value: 'search for a specific message\n\n__**seachTypes**__:\n**Exact**: seach for exact string of words.\n**Keyword**: search by keywords.\n**Fuzzy**: keyword but accounts for small spelling mistakes.\n\---',
			inline: false,
		},
		{
			name: '\`cb!uptime\`',
			value: 'Check my uptime.\n\---',
			inline: false,
		},
	],
};

const helpMessageDM =
{
	color: 0x23272a,
	title: 'Help(DM)',
	description: '(these options are required)[these are optional]',
	fields:
	[
		{
			name: 'cb!support',
			value: 'open a new support session',
			inline: true,
		},
		{
			name: 'cb!close',
			value: 'closes support messaging',
			inline: true,
		},

	],
};

const supportMessage = 
{
	color: 0x23272a,
	title: 'You started a new support session',
	description: 'Please be aware you are talking to a real person and a response may take a while.\nIf you ran into an error, providing the error message would help greatly.\nYou can close the session at any time by typing !close',
};



module.exports.helpMessage = helpMessage;
module.exports.helpMessageDM = helpMessageDM;
module.exports.supportMessage = supportMessage;