const { REST, Routes } = require("discord.js");
const { applicationId, loginToken } = require("../../config/config.json");

module.exports = deploy;

async function deploy(commands, guildId = null)
{
	const commandsJson = commands.map(command => command.data.toJSON());
	const rest = new REST().setToken(loginToken);

	let deployRoute;

	if (guildId != null) {
		deployRoute = Routes.applicationCommands(applicationId);
	}
	else {
		deployRoute = Routes.applicationGuildCommands(applicationId, guildId);
	}

	console.log(`Started refreshing ${commandsJson.length} slash commands.`);
	const result = await rest.put(deployRoute, { body: commandsJson });
	return result;
}
