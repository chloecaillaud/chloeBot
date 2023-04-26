const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } = require('discord.js');
const {handleInteractionError} = require('../handleInteractionErrors.js');
const guildSettingsManager = require('../guildSettingsManager.js');
const assert = require('assert');

//=====================================================================================

const COMMANDNAME = 'managecustomcommands';

//-------------------------------------------------------------------------------------
// build command data

const cmdData = new SlashCommandBuilder()
	.setName(COMMANDNAME)
	.setDescription('Manage the custom commands for this server.')
	.setDMPermission(false)
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	;

//-------------------------------------------------------------------------------------
// code executed when slash command is called

async function executeSlashCommand(interaction)
{
	const cancelMenu = getCancelMenu(true);

	const baseMenu = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId(`persistant_${COMMANDNAME}__add`)
				.setLabel('add')
				.setStyle(ButtonStyle.Success)
			,new ButtonBuilder()
				.setCustomId(`persistant_${COMMANDNAME}__modify`)
				.setLabel('modify')
				.setStyle(ButtonStyle.Secondary)
			,new ButtonBuilder()
				.setCustomId(`persistant_${COMMANDNAME}__remove`)
				.setLabel('remove')
				.setStyle(ButtonStyle.Danger)
			,new ButtonBuilder()
				.setCustomId(`void`)
				.setLabel('\u200B')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(true)
			,new ButtonBuilder()
				.setCustomId(`persistant_${COMMANDNAME}__clear`)
				.setLabel('clear all')
				.setStyle(ButtonStyle.Danger)
			);

	response = await interaction.reply({content: 'Select how you wish to manage custom commands for this server:', components: [baseMenu, cancelMenu], ephemeral: false});
	
}

//-------------------------------------------------------------------------------------
// code executed when button command is called

async function executeComponentCommand(interaction, interactionFilter)
{
	try
	{
		//early out if user who interacted isn't the one who initiated the original interaction
		originalUser = await interaction.message.interaction.user.fetch();
		if(originalUser.id !== interaction.user.id)
		{
			interaction.deferUpdate();
			return;
		}

		//use a filter to prevent repeat inputs before the message has it has been updated
		if(interactionFilter.has(interaction.message.id))
		{
			interaction.deferUpdate();
			return;
		}
		else
		{
			interactionFilter.add(interaction.message.id);
		}

		switch(interaction.componentInfo.subcommand)
		{
			case 'cancel':
				await persistantCancel(interaction, interactionFilter);
				break;
			case 'add':
				await updateMenuAdd(interaction, interactionFilter);
				break;
			case 'modify':
				await updateMenuModify(interaction, interactionFilter);
				break;
			case 'remove':
				await updateMenuRemove(interaction, interactionFilter);
				break;
			case 'clear':
				await updateMenuClear(interaction, interactionFilter);
				break;
			default:
				throw new Error('invalidComponent', {cause: {fancyMessage: 'invalid component: unknown component id.', ignore: false}});
		}
	}
	catch(err)
	{
		handleInteractionError(interaction, err);
		interactionFilter.delete(interaction.message.id);
	}
}

//-------------------------------------------------------------------------------------
//cancel

async function persistantCancel(interaction, interactionFilter)
{
	await interaction.message.delete();
	interactionFilter.delete(interaction.message.id);
}

//--------------------
//add subcommand

async function updateMenuAdd(interaction, interactionFilter)
{
	//do not defer update due to modal being an initial reply to an interaction
	const originalUserId = await interaction.message.interaction.user.fetch().then((user) => {return user.id});
	
	//get new command trigger & reply from user
	const replyInputMenu = getModalMenuAdd();
	interaction = await fetchModalInput(interaction, replyInputMenu, originalUserId);
	interactionFilter.delete(interaction.message.id);
	
	let newCommandTrigger = interaction.fields.getTextInputValue('newTrigger').trim();
	let newCommandReply = interaction.fields.getTextInputValue('newReply');
	assert(newCommandTrigger && newCommandReply, 'invalid submission');
	//check against existing custom commands
	if(!!guildSettingsManager.getCustomTextReply(interaction.guild.id, newCommandTrigger))
	{
		//create reply then delete it to dismiss modal
		modalDismissPromise = interaction.deferReply()
			.then(() => interaction.deleteReply());
		//remove previously created message
		messageDeletePromise = interaction.message.delete();
		await Promise.all([modalDismissPromise, messageDeletePromise])
			.then(() => {throw new Error('invalidSubmission', {cause: {fancyMessage: 'invalid submission: custom command already exsits.', ignore: false}});});
	}

	//get confirmation from user
	const confirmMenu = getConfirmMenu();
	interaction = await fetchUserInput(interaction, {content: `*Add the following custom command:* ${newCommandTrigger}\n *with reply:* ${newCommandReply} ?`, components: [confirmMenu], fetchReply: true}, originalUserId);

	await executeAdd(interaction, newCommandTrigger, newCommandReply);
}

async function executeAdd(interaction, customCommand, newCommandReply)
{
	const embedInfo = getEmbededModificationLog('add', interaction.user.username, customCommand, newCommandReply);
	guildSettingsManager.addCustomTextReply(interaction.guild.id, customCommand, newCommandReply);
	await updateMessage(interaction, {content: '', components: [], embeds: [embedInfo]});
}

//--------------------
//modify subcommand

async function updateMenuModify(interaction, interactionFilter)
{
	await interaction.deferUpdate();

	const originalUserId = await interaction.message.interaction.user.fetch().then((user) => {return user.id});
	const cancelMenu = getCancelMenu(false);
	
	//get custom command selection from user
	const customCommandPicker = await getCustomCommandSelectionMenu(interaction.guild.id);
	interaction = await fetchUserInput(interaction, {content: 'Pick a command to modify.', components: [customCommandPicker, cancelMenu], fetchReply: true}, originalUserId);
	interactionFilter.delete(interaction.message.id);
	assert(interaction !== undefined, `invalid submission`);

	let selectedCustomCommand = interaction.values[0];
	assert(selectedCustomCommand, 'invalid custom command');
	let selectedCommandReply = guildSettingsManager.getCustomTextReply(interaction.guild.id, selectedCustomCommand);

	//get new command reply from user
	const replyInputMenu = getModalMenuModify(selectedCustomCommand, selectedCommandReply);
	interaction = await fetchModalInput(interaction, replyInputMenu, originalUserId);
	
	let newCommandReply = interaction.fields.getTextInputValue('newReply');
	assert(newCommandReply, 'invalid submission');

	//get confirmation from user
	const confirmMenu = getConfirmMenu();
	interaction = await fetchUserInput(interaction, {content: `*Modify the following custom command:* ${selectedCustomCommand}\n *with reply:* ${newCommandReply} ?`, components: [confirmMenu], fetchReply: true}, originalUserId);

	await executeModify(interaction, selectedCustomCommand, newCommandReply);
}

async function executeModify(interaction, customCommand, newCommandReply)
{
	const embedInfo = getEmbededModificationLog('modify', interaction.user.username, customCommand, newCommandReply);
	guildSettingsManager.modifyCustomTextReply(interaction.guild.id, customCommand, newCommandReply);
	await updateMessage(interaction, {content: '', components: [], embeds: [embedInfo]});
}

//--------------------
//remove subcommand

async function updateMenuRemove(interaction, interactionFilter)
{

	await interaction.deferUpdate();

	const originalUserId = await interaction.message.interaction.user.fetch().then((user) => {return user.id});
	const cancelMenu = getCancelMenu(false);

	//get custom command selection from user
	const customCommandPicker = await getCustomCommandSelectionMenu(interaction.guild.id);
	interaction = await fetchUserInput(interaction, {content: 'Pick a command to remove.', components: [customCommandPicker, cancelMenu], fetchReply: true}, originalUserId);	
	interactionFilter.delete(interaction.message.id);
	assert(interaction !== undefined, `invalid submission`);

	let selectedCustomCommand = interaction.values[0];

	//get confirmation from user
	const confirmMenu = getConfirmMenu();
	interaction = await fetchUserInput(interaction, {content: `*Remove the following custom command:* ${selectedCustomCommand} ?`, components: [confirmMenu], fetchReply: true}, originalUserId);

	await executeRemove(interaction, selectedCustomCommand);
}

async function executeRemove(interaction, customCommand)
{
	const embedInfo = getEmbededModificationLog('remove', interaction.user.username, customCommand);
	guildSettingsManager.removeCustomTextReply(interaction.guild.id, customCommand);
	await updateMessage(interaction, {content: '', components: [], embeds: [embedInfo]});
}

//--------------------
// clear subcommand

async function updateMenuClear(interaction, interactionFilter)
{
	await interaction.deferUpdate();

	const originalUserId = await interaction.message.interaction.user.fetch().then((user) => {return user.id});
	const confirmMenu = getConfirmMenu();
	
	//get confirmation from user
	interaction = await fetchUserInput(interaction, {content: `Clear **all** customm commands for this server, __are you sure?__`, components: [confirmMenu], fetchReply: true}, originalUserId);
	interactionFilter.delete(interaction.message.id);

	await executeClear(interaction)
}

async function executeClear(interaction)
{
	const embedInfo = getEmbededModificationLog('clear', interaction.user.username, customCommand);
	guildSettingsManager.clearCustomTextReplies(interaction.guild.id);
	await updateMessage(interaction, {content: '', components: [], embeds: [embedInfo]});
}

//-------------------------------------------------------------------------------------
//interaction replying/collecting

/**
 * awaits a modal interaction
 * @async
 * @param {Interaction} interaction
 * @param {ModalData} modal
 * @param {string} allowedUserId
 * @param {number} [timeout] (optional) default: 1 min
 * @param {bool} [returnRawPromise] (optional) default: false
 * @returns {Promise<MessageComponentInteraction>}
 */
async function fetchModalInput(interaction, modal, allowedUserId, timeout = (2*60*1000), returnRawPromise = false)
{
	const componentInteractionFilter = (newInteraction) =>
	{
		return newInteraction.user.id === allowedUserId;
	}

	//albeit suboptimal, we create both a modal form as well a message cancel button and then await collection of the first to respond
	// this is due to the fact that modals do not notify when users dismiss/cancel the form,
	// therefore a seperate cancel button is needed to avoid waiting through to timeout.
	cancelButton = getCancelMenu(false);
	await interaction.showModal(modal);

	modalSubmit = interaction.awaitModalSubmit({componentInteractionFilter, time: timeout});
	cancelButton = fetchUserInput(interaction, {content: 'Waiting for form submit...', components: [cancelButton], fetchReply: true}, allowedUserId, timeout + 1000, true);

	//process the first to respond/timeout
	return Promise.race([modalSubmit, cancelButton])
		.catch(err =>
			{
				if(returnRawPromise) {return;}
				if(err.message.endsWith('time'))
				{
					interaction.message.delete();
					throw new Error('CollectorTimeout', {cause: {fancyMessage: 'Timed out: took too long, try again.', ignore: false}});
				}
				else
				{
					throw err;
				}
			}
		)
		.then((response) =>
			{
				if(returnRawPromise) {return response;}
				if(response.customId.endsWith('cancel'))
				{
					interaction.message.delete();
					throw new Error('interactionCanceled', {cause: {fancyMessage: '', ignore: true}});
				}
				return response;
			}
		);
}

/**
 * awaits a component interaction
 * @async
 * @param {Interaction} interaction
 * @param {InteractionReplyOptions} replyOptions
 * @param {string} allowedUserId
 * @param {number} [timeout] (optional) default: 1 min
 * @param {bool} [returnRawPromise] (optional) default: false
 * @returns {Promise<MessageComponentInteraction>}
 */
async function fetchUserInput(interaction, replyOptions, allowedUserId, timeout = (60*1000), returnRawPromise = false)
{
	const componentInteractionFilter = (newInteraction) =>
	{
		newInteraction.deferUpdate();
		return newInteraction.user.id === allowedUserId;
	}

	//disallow mentions when sending message
	replyOptions.allowedMentions = {parse: []};
	updateMessage(interaction, replyOptions);

	return interaction.message.awaitMessageComponent({componentInteractionFilter, time: timeout})
		.catch(err =>
			{
				if(returnRawPromise) {return err;}
				if(err.message.endsWith('time'))
				{
					interaction.message.delete();
					throw new Error('CollectorTimeout', {cause: {fancyMessage: 'Timed out: took too long, try again.', ignore: false}});
				}
				else
				{
					throw err;
				}
			}
		)
		.then((response) =>
			{
				if(returnRawPromise) {return response;}
				if(response.customId.endsWith('cancel'))
				{
					interaction.message.delete();
					throw new Error('interactionCanceled', {cause: {fancyMessage: '', ignore: true}});
				}
				return response;
			}
		);
}

/**
 * update a message regardless of replied/deffered status
 * @param {Interaction} interaction
 * @param {InteractionUpdateOptions} replyOptions
 * @returns {Promise<Message>|void}
 */
async function updateMessage(interaction, replyOptions)
{
	let msg;

	if (interaction.replied || interaction.deferred)
	{
		msg = interaction.editReply(replyOptions);
	}
	else
	{
		msg = interaction.update(replyOptions);
	}
	if(replyOptions.fetchReply === true) {return msg;}
}

//-------------------------------------------------------------------------------------
//menus / embed builders

/**
 * 
 * @param {string} modificationType
 * one of the following:
 * add | modify | remove | clear
 * @param {string} username
 * name of the user who initiated the command
 * @param {string} [commandTrigger] (optional)
 * @param {string} [commandReply] (optional)
 * @returns {EmbedBuilder}
 */
function getEmbededModificationLog(modificationType, username, commandTrigger = '\u200B', commandReply = '\u200B')
{
	const embed = new EmbedBuilder()
		.setFooter({ text: `user: ${username}`})
		;

	switch(modificationType)
	{
		case 'add':
			embed
				.setColor(Colors.DarkGreen)
				.setDescription('Added custom command:')
				.addFields({ name: commandTrigger, value: commandReply})
				;
			break;
		case 'modify':
			embed
				.setColor(Colors.Blue)
				.setDescription('Modified custom command:')
				.addFields({ name: commandTrigger, value: commandReply})
				;
			break;
		case 'remove':
			embed
				.setColor(Colors.Red)
				.setDescription('Removed custom command:')
				.addFields({ name: commandTrigger, value: commandReply})
				;
			break;
		case 'clear':
			embed
				.setColor(Colors.Red)
				.setDescription('Cleared all custom commands!')
				;
			break;
		default:
			throw new Error('invalidType', {cause: {fancyMessage: 'Error: failed to create imbed.', ignore: false}});
	}

	return embed;

}

/**
 * transient menu
 * @async
 * @param {string} guildId
 * @returns {Promise<ActionRowBuilder<StringSelectMenuBuilder>>}
 */
async function getCustomCommandSelectionMenu(guildId)
{
	let currentCustomCommands = await guildSettingsManager.getCustomTextReplies(guildId);

	let selectionMenuOptions = [];
	for(const [triggerMessage, replyMessage] of Object.entries(currentCustomCommands))
	{
		let option = new StringSelectMenuOptionBuilder()
			.setLabel(triggerMessage)
			.setDescription(`replies with: \n${replyMessage}`)
			.setValue(triggerMessage)

			selectionMenuOptions.push(option);
	}

	const selectionMenu = new ActionRowBuilder()
		.addComponents(
			new StringSelectMenuBuilder()
				.setCustomId('transient_commandSelection')
				.setPlaceholder(`select a custom command.`)
				.addOptions(selectionMenuOptions)
			);

	return selectionMenu;
}

/**
 * creates a text input modal menu prompting to add a custom command
 * 
 * transient modal menu
 * @returns {ActionRowBuilder<ModalActionRowComponentBuilder>}
 */
function getModalMenuAdd()
{
	const modal = new ModalBuilder()
		.setCustomId('transient_textModal')
		.setTitle('Add a new custom command')
		.addComponents(
			new ActionRowBuilder()
				.addComponents(
					new TextInputBuilder()
						.setCustomId('newTrigger')
						.setLabel('new trigger:')
						.setStyle(TextInputStyle.Short)
						.setPlaceholder('Enter some text that will trigger the bot to send a reply.')
						.setMaxLength(500)
						.setMinLength(2)
						.setRequired(true)
				)
			,new ActionRowBuilder()
				.addComponents(
					new TextInputBuilder()
						.setCustomId('newReply')
						.setLabel('new reply:')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder('Enter some text the bot will reply with.')
						.setMaxLength(1500)
						.setMinLength(1)
						.setRequired(true)
				)
		);

	return modal;
}

/**
 * creates a text input modal menu prompting to modfiy an existing custom command
 * 
 * transient modal menu
 * @param {string} subcommandName
 * @param {string} subcommandReply
 * @returns {ActionRowBuilder<ModalActionRowComponentBuilder>}
 */
function getModalMenuModify(subcommandName, subcommandReply)
{
	const modal = new ModalBuilder()
		.setCustomId('transient_textModal')
		.setTitle(`Modify: ${subcommandName}`)
		.addComponents(
			new ActionRowBuilder()
				.addComponents(
					new TextInputBuilder()
						.setCustomId('newReply')
						.setLabel('new reply:')
						.setStyle(TextInputStyle.Paragraph)
						.setValue(String(subcommandReply))
						.setMaxLength(1500)
						.setMinLength(1)
						.setRequired(true)
				)
		);

	return modal;
}

/**
 * creates a confirm/cancel button menu
 * 
 * transient menu
 * @returns {ActionRowBuilder<ButtonBuilder>}
 */
function getConfirmMenu()
{
	const confirmMenu = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('transient_confirm')
				.setLabel('confirm')
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setCustomId('transient_cancel')
				.setLabel('cancel')
				.setStyle(ButtonStyle.Danger)
			);
	
	return confirmMenu;
}

/**
 * creates a cancel button menu
 * @param {bool} isPersistent
 * is the button persistent, else transient
 * @returns {ActionRowBuilder<ButtonBuilder>}
 */
function getCancelMenu(isPersistent)
{
	let buttonId;
	buttonId = isPersistent ? `persistant_${COMMANDNAME}__cancel` : 'transient_cancel';
	
	const backCancelMenu = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId(buttonId)
				.setLabel('cancel')
				.setStyle(ButtonStyle.Danger)
			);

	return backCancelMenu;
}

//-------------------------------------------------------------------------------------
//prep command data for uploading
const rawCmdData = cmdData.toJSON();

//export abstracted data
module.exports =
{
	COMMANDNAME
	,rawCmdData
	,executeSlashCommand
	,executeComponentCommand
}