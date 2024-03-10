const deploy = require("../discord/commands/deploy");
const commands = require("../discord/commands/index.js");
const { devGuildId } = require("../config/config.json");

async function deployGlobally()
{
	const commandFiles = commands.fetch();
	const devCommands = commandFiles.filter((c) => c.isDev === true);
	const nonDevCommands = commandFiles.filter((c) => c.isDev !== true);

	try {
		let result = await deploy(devCommands, devGuildId);
		console.log(`Successfully reloaded ${result.length} dev slash commands.`);

		result = await deploy(nonDevCommands);
		console.log(`Successfully reloaded ${result.length} non-dev slash commands globally.`);
	}
	catch(error) {
		console.log(`Error reloading slash commands:`);
		console.log(error);
	}
}

deployGlobally();
