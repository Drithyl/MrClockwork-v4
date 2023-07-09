const { REST, Routes } = require("discord.js");
const { clientId, token } = require("../../config/config.json");
const commands = require("./index.js");

module.exports.toGuild = deployToGuild;
module.exports.globally = deployGlobally;

async function deployToGuild(guildId)
{
	const commandFiles = commands.read();
	const commandsJson = commandFiles.map(command => command.data.toJSON());

	const rest = new REST({ version: "10" }).setToken(token);

	const deployRoute = Routes.applicationGuildCommands(clientId, guildId);
	console.log(
		`Started refreshing ${commandsJson.length} slash commands.`
	);

	const result = await rest.put(deployRoute, { body: commandsJson });
	console.log(`Successfully reloaded ${result.length} slash commands.`);
}

async function deployGlobally()
{
	const commandFiles = commands.read();
	const commandsJson = commandFiles.map(command => command.data.toJSON());

	const rest = new REST({ version: "10" }).setToken(token);

	const deployRoute = Routes.applicationCommands(clientId);
	console.log(
		`Started refreshing ${commandsJson.length} slash commands globally.`
	);

	const result = await rest.put(deployRoute, { body: commandsJson });
	console.log(
		`Successfully reloaded ${result.length} slash commands globally.`
	);
}
