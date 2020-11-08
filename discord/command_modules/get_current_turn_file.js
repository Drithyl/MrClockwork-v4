
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const playerFileStore = require("../../player_data/player_file_store.js");

const commandData = new CommandData("GET_CURRENT_TURN_FILE");

module.exports = GetCurrentTurnFileCommand;

function GetCurrentTurnFileCommand()
{
    const getCurrentTurnFileCommand = new Command(commandData);

    getCurrentTurnFileCommand.addBehaviour(_behaviour);

    getCurrentTurnFileCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertMemberIsPlayer,
        commandPermissions.assertServerIsOnline,
        commandPermissions.assertGameHasStarted
    );

    return getCurrentTurnFileCommand;
}

function _behaviour(commandContext)
{
    const turnFileAttachments = [];
    const gameObject = commandContext.getGameTargetedByCommand();
    const gameName = gameObject.getName();

    const playerId = commandContext.getCommandSenderId();
    const playerFile = playerFileStore.getPlayerFile(playerId);
    const playerGameData = playerFile.getGameData(gameName);
    const controlledNations = playerGameData.getNationsControlledByPlayer();

    var messageString;

    return gameObject.update()
    .then((updateData) =>
    {
        messageString = `${gameName}'s turn ${updateData.currentTurnNumber}:`;
        return controlledNations.forEachPromise((nation, index, nextPromise) =>
        {
            const nationFilename = nation.getFilename();

            return gameObject.emitPromiseWithGameDataToServer("GET_TURN_FILE", { nationFilename })
            .then((turnFileBuffer) => 
            {
                turnFileAttachments.push({ 
                    attachment: turnFileBuffer, 
                    name: `${nationFilename}_turn_${updateData.currentTurnNumber}.trn`
                });

                return nextPromise();
            });
        });
    })
    .then(() => commandContext.respondToCommand(messageString, { files: turnFileAttachments }));
}