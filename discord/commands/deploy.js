const { REST, Routes } = require("discord.js");
const { applicationId, loginToken } = require("../../config/config.json");
const commands = require("./index.js");

module.exports = deploy;

async function deploy(guildId = null)
{
	const commandFiles = commands.fetch();
	const commandsJson = commandFiles.map(command => command.data.toJSON());

	const rest = new REST().setToken(loginToken);

	const deployRoute = Routes.applicationGuildCommands(applicationId, guildId);
	console.log(
		`Started refreshing ${commandsJson.length} slash commands.`
	);

	const result = await rest.put(deployRoute, { body: commandsJson });
	return result;
}
