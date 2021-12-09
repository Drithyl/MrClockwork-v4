
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

const activeMenuStore = require("../../menus/active_menu_store.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("CHANGE_SETTINGS");

module.exports = ChangeSettingsCommand;

function ChangeSettingsCommand()
{
    const changeSettingsCommand = new Command(commandData);

    changeSettingsCommand.addBehaviour(_behaviour);

    changeSettingsCommand.addRequirements(
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertServerIsOnline,
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertMemberIsOrganizer,
        commandPermissions.assertGameHasNotStarted
    );

    return changeSettingsCommand;
}

function _behaviour(commandContext)
{
    return commandContext.respondToCommand(new MessagePayload(`A DM was sent to you to change your settings.`))
    .then(() => activeMenuStore.startChangeSettingsMenu(commandContext));
}