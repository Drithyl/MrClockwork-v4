module.exports.load = load;

function load(client)
{
	const fs = require("node:fs");
	const path = require("node:path");

	const eventsPath = path.join(__dirname, "handlers");
	const files = fs.readdirSync(eventsPath);
	const eventFiles = files.filter(file => file.endsWith(".js"));

	for (const file of eventFiles)
	{
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);

        // Set a one-time event listener
        if (event.once === true)
            client.once(event.name, (...args) => event.execute(...args));

        // Set a permanent event listener
        else client.on(event.name, (...args) => event.execute(...args));
	}
}