
const log = require("../../logger.js");
const cleaner = require("../../cleaner.js");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("TOGGLE_CLEANER");

module.exports = ToggleCleanerCommand;

function ToggleCleanerCommand()
{
    const toggleCleanerCommand = new Command(commandData);

    toggleCleanerCommand.addBehaviour(_behaviour);

    toggleCleanerCommand.addRequirements(
        commandPermissions.assertMemberIsDev
    );

    return toggleCleanerCommand;
}

function _behaviour(commandContext)
{
    var result = cleaner.toggleIsCleaningEnabled();
    return commandContext.respondToCommand(`\`isCleaningEnabled\` set to ${result}.`);
}
