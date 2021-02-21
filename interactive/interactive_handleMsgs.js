const convoObj = require("./interactive_convoObj");
const logic = require("./interactive_logic");
const flow = require("./interactive_flow");

//=====================================================================================
// HANDLE INCOMING MESSAGES FOR INTERACTIVE CONVO
//=====================================================================================
async function doInteractiveCmd(client, message)
{
	const filter = msg => msg.author.id === message.author.id;
	const collector = message.channel.createMessageCollector(filter, { time: 300000, idle: 60000}); //timeout after 5 min, or 1 min inactive

	let outputText;
	let convo = {};
	let confOutput;
	let replyObj;

	Object.assign(convo, convoObj.convo);
	replyObj = await message.channel.send(flow.interactiveCmdsFlow.openingMsg());

	convo.messages.push(replyObj);
	convo.messages.push(message);

	collector.on('collect', async msg => 
	{
		convo.messages.push(msg);

		if (logic.checkStopRequest(client, msg, convo))
		{
			collector.stop('manualy stopped');
			return
		}
		if (logic.checkHelpRequest(client, msg, convo))
		{
			outputText = await logic.doIntHelp(client, msg, convo);
		}
		else if (convo.step === 0)
		{
			outputText = await logic.doFirstStep(client, msg, convo);
		}
		else if (convo.atConf === false)
		{
			outputText = await logic.doInfoCollectSteps(client, msg, convo);
		}
		else if (convo.atConf === true)
		{
			confOutput = logic.doConfirmStep(client, msg, convo);

			switch(confOutput)
			{
				case 'pass':
					collector.stop('run successfully');
					convo.selCmdFlow.executeFnc(client, msg, convo.selCmdObj.parameters);
					return;
				case 'fail':
					outputText = 'Would you like to restart?';
					break;
				case 'restart':
					outputText = await logic.setupNextStep(client, message, convo);
					break;
				case 'end':
					collector.stop('failed confirmation');
					return;
				case 'unsure':
					outputText = 'I can\'t figure out if you mean yes or no, could you rephrase that?';
					break;
				default:
					console.log('!nothing returned!');
			}
		}

		replyObj = await message.channel.send(outputText);

		convo.messages.push(replyObj);
	});
//-------------------------------------------------------------------------------------

	collector.on('end', async (collected, reason) => 
	{
		let closingMsg;
		
		console.log(reason);

		message.channel.bulkDelete(convo.messages);

		switch(reason)
		{
			case 'manualy stopped':
				closingMsg = await message.channel.send(`Ok, I\'ll cancel that, it was nice talking to you ${message.author.username}.`);
				closingMsg.delete({timeout: 15000});
				break;
			case 'idle':
			case 'time':
				closingMsg = await message.channel.send(`Looks like we ran out of time sorry, but it was nice talking to you ${message.author.username}.`);
				closingMsg.delete({timeout: 15000});
				break;
			case 'failed confirmation':
				closingMsg = await message.channel.send(`Sorry im not sure how I can help then, but it was nice talking to you ${message.author.username}.`);
				closingMsg.delete({timeout: 15000});
				break;
			case 'run successfully':
				closingMsg = await message.channel.send(`Ok all done then, it was nice talking to you ${message.author.username}.`);
				closingMsg.delete({timeout: 15000});
				break;
			case 'ran into error':
				message.channel.send(`Oops, im so sorry, looks like I ran into a problem.`);
				break;
			default:
				console.log('!ended without reason!');
		}
	});
};

//=====================================================================================
module.exports =
{
	doInteractiveCmd,
};