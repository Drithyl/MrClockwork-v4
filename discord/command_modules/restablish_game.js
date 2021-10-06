
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const ongoingGamesStore = require("../../games/ongoing_games_store.js");

const commandData = new CommandData("RESTABLISH_GAME");

module.exports = RestablishGameCommand;

function RestablishGameCommand()
{
    const restablishGameCommand = new Command(commandData);

    restablishGameCommand.addBehaviour(_behaviour);

    restablishGameCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertMemberIsGameMaster
    );

    return restablishGameCommand;
}

function _behaviour(commandContext)
{
    const guildWrapper = commandContext.getGuildWrapper();
    const commandArgumentsArray = commandContext.getCommandArgumentsArray();
    const nameOfGameToRepair = commandArgumentsArray[0];
    var gameObject;
    

    if (ongoingGamesStore.hasOngoingGameByName(nameOfGameToRepair) === false)
        return commandContext.respondToCommand(`No game found with this name.`);

    gameObject = ongoingGamesStore.getOngoingGameByName(nameOfGameToRepair);

    return Promise.resolve()
    .then(() =>
    {
        if (guildWrapper.findChannel(gameObject.getChannelId()) == null)
            return gameObject.createNewChannel();

        else return Promise.resolve()
    })
    .then(() =>
    {
        if (guildWrapper.findRole(gameObject.getRoleId()) == null)
            return gameObject.createNewRole();

        else return Promise.resolve()
    })
    .then(() => commandContext.respondToCommand(`The game's channel and role have been restablished.`));
}