
const guildStore = require("./guild_store.js");

exports.startDiscordIntegration = async () =>
{
    const client = await initializeClient();
    const guilds = client.guilds.cache;

    await guildStore.populateStore(guilds);
};

async function initializeClient()
{
    const discordClient = require("./client");
    const client = discordClient.create();

    await discordClient.login(client);
    return client;
}