module.exports = fetchCommands;

function fetchCommands()
{
	const fs = require("node:fs");
	const path = require("node:path");
	const { Collection } = require("discord.js");

	const commands = new Collection();
	const commandsPath = path.join(__dirname, "files");
	const files = fs.readdirSync(commandsPath);
	const commandFiles = files.filter(file => file.endsWith(".js"));

	for (const file of commandFiles)
	{
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		// Set a new item in the Collection
		// With the key as the command name and the value as the exported module
		commands.set(command.data.name, command);
	}

	return commands;
}