
const guildStore = require("../guild_store.js");
const commandStore = require("../command_store.js");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("UPDATE_HELP_CHANNELS");

module.exports = UpdateHelpChannelsCommand;

function UpdateHelpChannelsCommand()
{
    const updateHelpChannelsCommand = new Command(commandData);

    updateHelpChannelsCommand.addBehaviour(_behaviour);

    updateHelpChannelsCommand.addSilentRequirements(
        commandPermissions.assertMemberIsDev
    );

    return updateHelpChannelsCommand;
}

function _behaviour(commandContext)
{
    var commandArgumentsArray = commandContext.getCommandArgumentsArray();
    var idOfGuildToUpdate = commandArgumentsArray[0];
    var updatedHelpString = _createHelpString();

    return guildStore.updateHelpChannels(new MessagePayload(updatedHelpString), idOfGuildToUpdate)
    .then(() => commandContext.respondToCommand(new MessagePayload(`Help channels have been updated.`)));
}

function _createHelpString()
{
    var string = `Below are the commands available. Each one contains information about what it does and the arguments (sometimes optional, sometimes required) that make them work:\n\n`;
    var commands = [];

    commandStore.forEachCommand((command) => 
    {
        if (command.isDevOnly() === false)
            commands.push(command);
    });

    commands.sort((a, b) => 
    {
        if (a.getName() < b.getName())
            return -1;
        if (a.getName() > b.getName())
            return 1;
        return 0;
    });
    
    commands.forEach((command) => string += command.getFormattedHelp());

    return string;
}