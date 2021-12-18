
const cleaner = require("../../cleaner.js");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("DELETE_UNUSED_MAPS");

module.exports = DeleteUnusedMapsCommand;

function DeleteUnusedMapsCommand()
{
    const deleteUnusedMapsCommand = new Command(commandData);

    deleteUnusedMapsCommand.addBehaviour(_behaviour);

    deleteUnusedMapsCommand.addSilentRequirements(
        commandPermissions.assertMemberIsDev
    );

    return deleteUnusedMapsCommand;
}

function _behaviour(commandContext)
{
    const commandArgumentsArray = commandContext.getCommandArgumentsArray();
    const isForcingDeletion = /^force$/i.test(commandArgumentsArray[0]);

    return cleaner.cleanUnusedMaps(isForcingDeletion)
    .then((deletedMaps) =>
    {
        const deletedMapsStringList = deletedMaps.join("\n");
        const payload = new MessagePayload(`A total of ${deletedMaps.length} map-related files were deleted.`);
        payload.setAttachment("deleted_maps.txt", Buffer.from(deletedMapsStringList, "utf8"));
        
        return commandContext.respondToCommand(payload);
    })
    .catch((err) => commandContext.respondToCommand(new MessagePayload(`Error occurred: ${err.message}\n\n${err.stack}`)));
}