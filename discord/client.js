module.exports.create = () =>
{
	// Require the necessary discord.js classes
	const { Client, GatewayIntentBits } = require("discord.js");
	const events = require("./events/index");
	const commands = require("./commands/index");

	// Create a new client instance with the correct intents. See:
    // https://discordjs.guide/popular-topics/intents.html#error-disallowed-intents
	const client = new Client({ 
		intents:
		[
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildMessageReactions,
			GatewayIntentBits.DirectMessages,
			GatewayIntentBits.DirectMessageReactions
		]
	});
	
	events.load(client);
	client.commands = commands.fetch();
	return client;
};

module.exports.login = async (client) =>
{
	const config = require("../config/config.json");

	await client.login(config.loginToken);
        
	if (config.devIds == null || config.devIds.length <= 0)
		return;

	const mainDevId = config.devIds[0];
	const mainDevUser = await client.users.fetch(mainDevId);
	const UserWrapper = require("./wrappers/user_wrapper.js");

	module.exports.devUserWrapper = new UserWrapper(mainDevUser);
	module.exports.botId = client.user.id;
};

module.exports.messageDev = (payload) => 
{
	return module.exports.devUserWrapper.sendMessage(payload);
};

module.exports.fetchUser = async (client, userId) =>
{
	const user = await client.users.fetch(userId, { cache: true });
	const UserWrapper = require("./wrappers/user_wrapper.js");
	const userWrapper = new UserWrapper(user);
	return userWrapper;
};