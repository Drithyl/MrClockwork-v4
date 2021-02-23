
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const playerFileStore = require("../../player_data/player_file_store.js");

const commandData = new CommandData("PRUNE_DATA");

module.exports = PruneDataCommand;

function PruneDataCommand()
{
    const pruneDataCommand = new Command(commandData);

    pruneDataCommand.addBehaviour(_behaviour);

    pruneDataCommand.addSilentRequirements(
        commandPermissions.assertMemberIsDev
    );

    return pruneDataCommand;
}

function _behaviour(commandContext)
{
    return commandContext.respondToCommand("Pruning obsolete data...")
    .then(() => playerFileStore.clearObsoleteData())
    .then(() => commandContext.respondToCommand("Obsolete data pruned."));
}