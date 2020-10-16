
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const { SemanticError } = require("../../errors/custom_errors.js");

const commandData = new CommandData("CREATE_GAME_CHANNEL");

module.exports = CreateGameChannelCommand;

function CreateGameChannelCommand()
{
    const createGameChannelCommand = new Command(commandData);

    createGameChannelCommand.addBehaviour(_behaviour);

    createGameChannelCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        _doesNameContainInvalidCharacters
    );

    return createGameChannelCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const commandArguments = commandContext.getCommandArgumentsArray();
    const nameOfNationToBeClaimed = commandArguments[0];

    //TODO: check nation name/filename here, with the dom5 nation JSON data?

    return gameObject.claimPretender(nameOfNationToBeClaimed);
}

function _doesNameContainInvalidCharacters(commandContext)
{
    const commandArguments = commandContext.getCommandArgumentsArray();
    const nameOfChannel = commandArguments[0];

    if (/[^0-9A-Z\-_]/i.test(nameOfChannel) === true)
        throw new SemanticError(`Name contains invalid cahracters.`);
}