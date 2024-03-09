const deploy = require("../discord/commands/deploy");

async function deployGlobally()
{
	try {
		const result = await deploy();
		console.log(`Successfully reloaded ${result.length} slash commands globally.`);
	}
	catch(error) {
		console.log(`Error reloading slash commands globally:`);
		console.log(error);
	}
}

deployGlobally();
