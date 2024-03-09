const deploy = require("../discord/commands/deploy");

async function deployToGuild(guildId)
{
	try {
		const result = await deploy(guildId);
		console.log(`Successfully reloaded ${result.length} slash commands for guild ${guildId}.`);
	}
	catch(error) {
		console.log(`Error reloading slash commands for guild ${guildId}:`);
		console.log(error);
	}
}

const GUILD_ID_TO_DEPLOY = "724340426248683570";
deployToGuild(GUILD_ID_TO_DEPLOY);
