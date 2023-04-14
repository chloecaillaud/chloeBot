const fs = require('fs');
const assert = require('assert');
//=====================================================================================
// HANDLE ALL INCOMING MESSAGES
//=====================================================================================
function handleInteraction(interaction, interactionFilter)
{
	if(interaction.user.bot) return;

	if(interaction.isChatInputCommand())
	{
		handleChatInputInteraction(interaction);
	}
	else if(interaction.isButton())
	{
		handleComponentInteraction(interaction, interactionFilter)
	}
}

async function handleChatInputInteraction(interaction)
{
	try
	{
		//get all slash commands from their files, and match to interaction name
		const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
		for(file of commandFiles)
		{
			let command = require(`./commands/${file}`);
			if(command.COMMANDNAME == interaction.commandName)
			{
				command.executeSlashCommand(interaction);
			}
		}
	}
	catch(err)
	{
		interaction.reply(`something went wrong: ${err.message}`)
		.catch(console.error(err));
	}
}

async function handleComponentInteraction(interaction, interactionFilter)
{
	try
	{
		//persistance refers to component's lifespan
		// persistant: theoretically forever, this means it needs to be received externaly from the command file
		// transient:  no longer than the interaction token lifespan, can be treated with async collectors/ awaits
		// void:       shouldnt be treated either way (usualy spacer buttons)
		if(interaction.customId.startsWith('transient')) {return;}
		if(interaction.customId.startsWith('void')) {interaction.deferUpdate();}
		
		//persistant component customId structure: persistance_command_subcategory_subcommand
		const componentInfoArray = interaction.customId.split('_');
		assert(componentInfoArray.length === 4, 'Component\'s customId does not follow proper structure.');
		interaction.componentInfo = {
			command:     componentInfoArray[1]
			,subcategory: componentInfoArray[2]
			,subcommand:  componentInfoArray[3]
			};

		//get all commands from their files, and match to interaction name
		const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
		for(file of commandFiles)
		{
			let command = require(`./commands/${file}`);
			if(command.COMMANDNAME == interaction.componentInfo.command)
			{

				command.executeComponentCommand(interaction, interactionFilter);
			}
		}
	}
	catch(err)
	{
		interaction.reply({content:`something went wrong: ${err.message}`, ephemeral: true})
		.catch(console.error(err));
	}
}
exports.handleInteraction = handleInteraction;