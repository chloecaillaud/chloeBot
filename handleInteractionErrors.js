const Discord = require('discord.js');

function handleInteractionError(interaction, error)
{
	if(error instanceof Discord.DiscordAPIError) {handleAPIError(interaction, error);}
	else if(error instanceof Discord.DiscordjsError) {handleDiscordJsError(interaction, error);}
	else if(error instanceof Error) {handleJsError(interaction, error);}
}

//-------------------------------------------------------------------------------------

async function handleAPIError(interaction, error)
{
	let isUnknownError = false;
	let failedAction = '';

	switch(error.method)
	{
		case 'GET':
			failedAction = 'retrieve';
			break;
		case 'POST':
			failedAction = 'send';
			break;
		case 'PATCH':
		case 'PUT':
			failedAction = 'modify';
			break;
		case 'DELETE':
			failedAction = 'delete';
			break;
		default:
			isUnknownError = true;

	}
	
	const errorMessage = isUnknownError ? `Unknown error: \n${error.message}` : `Error, failed to ${failedAction} data: \n${error.message}`;
	const messageSucess = sendErrorMessage(interaction, errorMessage);
	messageSucess ? console.log('notified user of following error:') : console.warn('Failed to notify user of the following error:');
	console.error(error);
}

function handleDiscordJsError(interaction, error)
{
	//TODO: handle common errors with more grace
	let errorMessage = `Error, Discordjs code: \n${error.code}`;
	const messageSucess = sendErrorMessage(interaction, errorMessage);
	messageSucess ? console.log('notified user of following error:') : console.warn('Failed to notify user of the following error:');
	console.error(error);
}

function handleJsError(interaction, error)
{
	//thrown error format: (message<string>, {cause:{fancyMessage: <string>, ignore: <bool>}})
	if(error.cause && error.cause.ignore) {return;}

	let errorMessage = (error.cause && !!error.cause.fancyMessage) ? error.cause.fancyMessage : `Error: ${error.message}`;
	const messageSucess = sendErrorMessage(interaction, errorMessage);
	messageSucess ? console.log('notified user of following error:') : console.warn('Failed to notify user of the following error:');
	console.error(error);
}

/**
 * 
 * @param {Interaction} interaction
 * @param {string} errormessage
 * @returns {bool} success
 */
async function sendErrorMessage(interaction, errormessage)
{
	let replyOptions = {content: errormessage, fetchReply: true, ephemeral: true};
	
	sentReply = (interaction.replied || interaction.deferred) ? interaction.followUp(replyOptions) : sentReply = interaction.reply(replyOptions);
	
	return await sentReply
		.then( () => true )
		.catch(() => false)
		;
}
//-------------------------------------------------------------------------------------

module.exports =
{
	handleInteractionError
}