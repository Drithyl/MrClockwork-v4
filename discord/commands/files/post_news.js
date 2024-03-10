const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");
const guildStore = require("../../guild_store.js");
const log = require("../../../logger.js");


const MESSAGE_OPTION_NAME = "news_message";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("post")
		.setDescription("[Dev-only] Posts a message across all clockwork_news channels.")
        .addStringOption(option =>
            option.setName(MESSAGE_OPTION_NAME)
            .setDescription("The message to post on the news channels of associated guilds.")
            .setRequired(true)
        ),

	execute: behaviour,

    // This command will never be deployed globally; only to a private dev guild
    isDev: true
};


async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsDev(commandContext);

    const news = commandContext.options.getString(MESSAGE_OPTION_NAME);

    return guildStore.forAllGuilds((guildWrapper) => 
    {
        log.general(log.getNormalLevel(), `Cycling through guild ${guildWrapper.getName()} to post news`);

        try
        {
            guildWrapper.postNews(new MessagePayload(news));
        }

        catch(err)
        {
            commandContext.respondToCommand(new MessagePayload(
                `Error occurred when posting to ${guildWrapper.getName()}:\n\n${err.message}`
            ));
        }
    });
}