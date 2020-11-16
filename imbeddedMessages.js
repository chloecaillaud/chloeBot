const helpMessage =
{
	color: 0x23272a,
	title: 'Help',
	description: '(these options are required)[these are optional]',
	fields: [
		{
			name: 'cb!clearnick',
			value: 'clear your nickname',
			inline: true,
		},
		{
			name: 'cb!nick (@username) (nickname)',
			value: 'set the nickname of someone or yourself(if not specified)',
			inline: true,
		},
		{
			name: 'cb!nukechannel [amount]',
			value: '(admin only) clear messages from channel',
			inline: true,
		},
		{
			name: 'cb!setup',
			value: '!work in prgress! doesn\'t currently do anything',
			inline: true,
		},
		{
			name: 'cb!badbot',
			value: 'removes the last fredboat message',
			inline: true,
		},
		{
			name: 'cb!support',
			value: 'open a new support session',
			inline: true,
		},
	],
};

const helpMessageDM =
{
	color: 0x23272a,
	title: 'Help(DM)',
	description: '(these options are required)[these are optional]',
	fields: [
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