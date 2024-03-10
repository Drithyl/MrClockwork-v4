const deploy = require("../discord/commands/deploy");
const commands = require("../discord/commands/index.js");
const { devGuildId } = require("../config/config.json");

async function deployToGuild(guildId)
{
	try {
		const commandFiles = commands.fetch();
		const result = await deploy(commandFiles, guildId);
		console.log(`Successfully reloaded ${result.length} slash commands for guild ${guildId}.`);
	}
	catch(error) {
		console.log(`Error reloading slash commands for guild ${guildId}:`);
		console.log(error);
	}
}

deployToGuild(devGuildId);
