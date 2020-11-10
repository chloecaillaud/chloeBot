const helpMessage = 
{
	color: 0x23272a,
	title: 'Help',
	description: '(these options are required)[these are optional]',
/*	thumbnail: {
		url: '',
	},
*/	fields: [
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
			value: '!work in prgress! doesn\'t currently do anything',
			inline: true,
		},
	],
/*	image: {
		url: 'https://i.imgur.com/wSTFkRM.png',
	},
	footer: {
		text: 'Some footer text here',
		icon_url: 'https://i.imgur.com/wSTFkRM.png',
	},*/
};

module.exports.helpMessage = helpMessage;