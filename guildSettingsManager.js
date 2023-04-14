const fs = require('fs');

//==============================================================

const GUILD_SETTINGS_DIR = './guildSettings/';
const DEFAULT_SETTINGS_OBJ = {customTextReplies: {}};

//==============================================================
//manage whole guild settings files


/**
 * creates a new file for specified guild, if already exists clears previous version
 * @param {string} guildId
 * the guild's id as obtained from Discord.guild.id
 */
function createNewGuildSettings(guildId)
{
	const filePath    = GUILD_SETTINGS_DIR + guildId + '.json';
	const fileContent = JSON.stringify(DEFAULT_SETTINGS_OBJ, null, 4);

	fs.writeFileSync(filePath, fileContent, {flag: 'wx'});
}


/**
 * unlinks th file associated with the specified guild
 * @async
 * @param {string} guildId
 * the guild's id as obtained from Discord.guild.id
 * @returns {promise<undefined>}
 */
async function removeGuildSettings(guildId)
{
	const filePath = GUILD_SETTINGS_DIR + guildId + '.json';

	return fs.promises.unlink(filePath);
}

//==============================================================
//manage only custom text replies

/**
 * @param {string} guildId
 * the guild's id as obtained from Discord.guild.id
 */
function clearCustomTextReplies(guildId)
{
	const filePath = GUILD_SETTINGS_DIR + guildId + '.json';
	if(!isValidFile(filePath))
	{
		return;
	}

	const settings = JSON.parse(fs.readFileSync(filePath));
	
	settings.customTextReplies = {};

	fs.writeFileSync(filePath, JSON.stringify(settings, null, 4));
}

/**
 * @param {string} guildId
 * the guild's id as obtained from Discord.guild.id
 * @param {string} textCommand
 * the string assigned as the trigger for this text reply
 * @param {string} textReply
 * the associated response for the aforementioned textCommand
 */
function addCustomTextReply(guildId, textCommand, textReply)
{
	const filePath = GUILD_SETTINGS_DIR + guildId + '.json';
	if(!isValidFile(filePath))
	{
		createNewGuildSettings(guildId);
	}

	const settings = JSON.parse(fs.readFileSync(filePath));

	if(!!settings.customTextReplies[textCommand])
	{
		throw new Error('guildManagerError', {cause: {fancyMessage: 'Error: specified command already exists.', ignore: false}});
	}
	else
	{
		settings.customTextReplies[textCommand] = textReply;
	}

	fs.writeFileSync(filePath, JSON.stringify(settings, null, 4));
}

/**
 * @param {string} guildId
 * the guild's id as obtained from Discord.guild.id
 * @param {string} textCommand
 * the string assigned as the trigger for this text reply
 */
function removeCustomTextReply(guildId, textCommand)
{
	const filePath = GUILD_SETTINGS_DIR + guildId + '.json';
	if(!isValidFile(filePath))
	{
		throw new Error('guildManagerError', {cause: {fancyMessage: 'Error: failed to find guild settings.', ignore: false}});
	}

	const settings = JSON.parse(fs.readFileSync(filePath));

	if(!settings.customTextReplies[textCommand])
	{
		throw new Error('guildManagerError', {cause: {fancyMessage: 'Error: specified command already exists.', ignore: false}});
	}
	else
	{
		delete settings.customTextReplies[textCommand];
	}

	fs.writeFileSync(filePath, JSON.stringify(settings, null, 4));
}

/**
 * @param {string} guildId
 * the guild's id as obtained from Discord.guild.id
 * @param {string} textCommand
 * the string assigned as the trigger for this text reply
 * @param {string} textReply
 * the associated response for the aforementioned textCommand
 */
function modifyCustomTextReply(guildId, textCommand, textReply)
{
	const filePath = GUILD_SETTINGS_DIR + guildId + '.json';
	if(!isValidFile(filePath))
	{
		throw new Error('guildManagerError', {cause: {fancyMessage: 'Error: failed to find guild settings.', ignore: false}});
	}

	const settings = JSON.parse(fs.readFileSync(filePath));

	if(!settings.customTextReplies[textCommand])
	{
		throw new Error('guildManagerError', {cause: {fancyMessage: 'Error: could not find specified command.', ignore: false}});
	}
	else
	{
		settings.customTextReplies[textCommand] = textReply;
	}

	fs.writeFileSync(filePath, JSON.stringify(settings, null, 4));
}

/**
 * @param {string} guildId
 * the guild's id as obtained from Discord.guild.id
 * @param {string} textCommand
 * the string assigned as the trigger for this text reply
 * @returns {string}
 * the associated response for the aforementioned textCommand
 */
function getCustomTextReply(guildId, textCommand)
{
	const filePath = GUILD_SETTINGS_DIR + guildId + '.json';
	if(!isValidFile(filePath))
	{
		createNewGuildSettings(guildId);
	}

	const settings = JSON.parse(fs.readFileSync(filePath));

	if(!settings.customTextReplies[textCommand])
	{
		throw new Error('guildManagerError', {cause: {fancyMessage: 'Error: failed to find guild settings.', ignore: false}});
	}
	else
	{
		return settings.customTextReplies[textCommand];
	}
}

/**
 * @param {string} guildId
 * the guild's id as obtained from Discord.guild.id
 * @returns {dict}
 * consists of {command, response} pairs
 */
function getCustomTextReplies(guildId)
{
	const filePath = GUILD_SETTINGS_DIR + guildId + '.json';
	if(!isValidFile(filePath))
	{
		throw new Error('guildManagerError', {cause: {fancyMessage: 'Error: failed to find guild settings.', ignore: false}});
	}

	const settings = JSON.parse(fs.readFileSync(filePath));

	if(Object.keys(settings.customTextReplies).length === 0)
	{
		Error('guildManagerError', {cause: {fancyMessage: 'Error: could not find specified command.', ignore: false}});
	}
	else
	{
		return settings.customTextReplies;
	}
}

//==============================================================
//internal functions

function isValidFile(filePath)
{
	try
	{
		fs.accessSync(filePath, fs.constants.W_OK | fs.constants.R_OK);
		return true;
	}
	catch(err)
	{
		return false;
	}
}

//==============================================================
//exports

module.exports =
{
	createNewGuildSettings
	,removeGuildSettings

	,clearCustomTextReplies
	,addCustomTextReply
	,removeCustomTextReply
	,modifyCustomTextReply
	,getCustomTextReply
	,getCustomTextReplies


}