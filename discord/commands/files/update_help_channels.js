const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const commandPermissions = require("../../command_permissions.js");
const guildStore = require("../../guild_store.js");


const GUILD_OPTION_NAME = "guild_id";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("update_help")
		.setDescription("[Dev-only] Re-writes the help information on the guild's help channel.")
        .addStringOption(option =>
            option.setName(GUILD_OPTION_NAME)
            .setDescription("A guild ID, if only one channel requires updating.")
        ),

	execute: behaviour,

    // This command will never be deployed globally; only to a private dev guild
    isDev: true
};


async function behaviour(commandContext, client)
{
    await commandPermissions.assertMemberIsDev(commandContext);

    const idOfGuildToUpdate = commandContext.options.getString(GUILD_OPTION_NAME);
    let updatedHelpString = _createHelpString(client.commands);

    await guildStore.updateHelpChannels(new MessagePayload(updatedHelpString), idOfGuildToUpdate);
    
    return commandContext.respondToCommand(new MessagePayload(
        `Help channels have been updated.`
    ));
}

function _createHelpString(commands)
{
    const commandNames = Array.from(commands.keys());
    let string = `Below are the commands available. Each one contains information about what it does and the arguments (sometimes optional, sometimes required) that make them work:\n\n`;

    commandNames.sort().forEach((key) =>
    {
        const command = commands.get(key);

        if (command.isDevOnly == false)
            string += describeCommand(command);
    });

    return string;
}

function describeCommand(command)
{
    const name = command.data.name;
    const description = command.data.description;
    return `-------------------\n\n**/${name}**\n\n${description}\n\n`;
}