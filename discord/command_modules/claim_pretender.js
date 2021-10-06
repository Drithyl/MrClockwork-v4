
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const dom5NationStore = require("../../games/dominions5_nation_store");
const { SemanticError } = require("../../errors/custom_errors.js");

const commandData = new CommandData("CLAIM_PRETENDER");

module.exports = ClaimPretenderCommand;

function ClaimPretenderCommand()
{
    const claimPretenderCommand = new Command(commandData);

    claimPretenderCommand.addBehaviour(_behaviour);

    claimPretenderCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        commandPermissions.assertCommandIsUsedInGameChannel,
        commandPermissions.assertGameIsOnline
    );

    return claimPretenderCommand;
}

function _behaviour(commandContext)
{
    const gameObject = commandContext.getGameTargetedByCommand();
    const gameSettings = gameObject.getSettingsObject();
    const eraSetting = gameSettings.getEraSetting();

    const playerId = commandContext.getCommandSenderId();
    const commandArguments = commandContext.getCommandArgumentsArray();
    const nameOfNationToBeClaimed = commandArguments[0];
    const nationObject = dom5NationStore.getNationInEra(nameOfNationToBeClaimed, eraSetting.getValue());

    //TODO: check nation name/filename here, with the dom5 nation JSON data?
    if (nationObject == null)
        throw new SemanticError(`Invalid nation identifier provided.`);

    return gameObject.checkIfNationIsSubmitted(nationObject.getFilename())
    .then((isSubmitted) =>
    {
        if (isSubmitted === false)
            return Promise.reject(new Error(`Nation is not submitted.`));

        else return gameObject.claimNation(playerId, nationObject.getFilename());
    })
    .then(() => commandContext.respondToCommand(`Pretender was claimed.`))
    .catch((err) => commandContext.respondToCommand(`Error occurred when claiming pretender:\n\n${err.message}`));
}