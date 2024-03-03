
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("PIN_SETTINGS");

module.exports = PinSettingsCommand;

function PinSettingsCommand()
{
    const pinSettingsCommand = new Command(commandData);

    pinSettingsCommand.addBehaviour(_behaviour);

    pinSettingsCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertMemberIsOrganizer
    );

    return pinSettingsCommand;
}

async function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    await commandContext.respondToCommand(new MessagePayload(`Below are the game's settings:`));
    await gameObject.pinSettingsToChannel();
}
