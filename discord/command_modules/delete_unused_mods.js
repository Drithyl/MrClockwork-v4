
const cleaner = require("../../cleaner.js");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("DELETE_UNUSED_MODS");

module.exports = DeleteUnusedModsCommand;

function DeleteUnusedModsCommand()
{
    const deleteUnusedModsCommand = new Command(commandData);

    deleteUnusedModsCommand.addBehaviour(_behaviour);

    deleteUnusedModsCommand.addSilentRequirements(
        commandPermissions.assertMemberIsDev
    );

    return deleteUnusedModsCommand;
}

function _behaviour(commandContext)
{
    const commandArgumentsArray = commandContext.getCommandArgumentsArray();
    const isForcingDeletion = /^force$/i.test(commandArgumentsArray[0]);

    return cleaner.cleanUnusedMods(isForcingDeletion)
    .then((deletedMods) =>
    {
        const deletedModsStringList = deletedMods.join("\n");
        const payload = new MessagePayload(`A total of ${deletedMods.length} mod-related files were deleted.`);
        payload.setAttachment("deleted_mods.txt", Buffer.from(deletedModsStringList, "utf8"));
        
        return commandContext.respondToCommand(payload);
    })
    .catch((err) => commandContext.respondToCommand(new MessagePayload(`Error occurred: ${err.message}\n\n${err.stack}`)));
}