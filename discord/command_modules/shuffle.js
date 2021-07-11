
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("SHUFFLE");

module.exports = ShuffleCommand;

function ShuffleCommand()
{
    const shuffleCommand = new Command(commandData);

    shuffleCommand.addBehaviour(_behaviour);

    shuffleCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted
    );

    return shuffleCommand;
}


function _behaviour(commandContext)
{
    const args = commandContext.getCommandArgumentsArray();
    const mentionedMembers = commandContext.getMentionedMembers();
    var elementsToShuffle = args;

    if (args.length <= 0)
        return commandContext.respondToCommand(`You must include a space-separated list of things to shuffle. These can be mentions to members in your game for a draft order.`);

    if (mentionedMembers != null && mentionedMembers.length > 0)
        elementsToShuffle = mentionedMembers.map((memberWrapper) => memberWrapper.getNameInGuild());

    elementsToShuffle = _shuffle(elementsToShuffle);
    return commandContext.respondToCommand(`Below is your suffled list:\n\n${elementsToShuffle.join("\n").toBox()}`);
}


function _shuffle(memberArray)
{
    var currentIndex = memberArray.length;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [memberArray[currentIndex], memberArray[randomIndex]] = [memberArray[randomIndex], memberArray[currentIndex]];
    }

    return memberArray;
}