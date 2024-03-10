const { REST, Routes } = require("discord.js");
const { applicationId, loginToken } = require("../../config/config.json");

module.exports.deleteAll = deleteAll;

async function deleteAll(guildId = null)
{
	const rest = new REST().setToken(loginToken);

	let deleteRoute;

	if (guildId != null) {
		deleteRoute = Routes.applicationGuildCommands(applicationId, guildId);
	}
	else {
		deleteRoute = Routes.applicationCommands(applicationId);
	}

	console.log(`Started deleting slash commands.`);
	const result = await rest.put(deleteRoute, { body: [] });
	return result;
}
