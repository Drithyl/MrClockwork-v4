
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("SHUFFLE");

module.exports = ShuffleCommand;

function ShuffleCommand()
{
    const shuffleCommand = new Command(commandData);

    shuffleCommand.addBehaviour(_behaviour);

    return shuffleCommand;
}


function _behaviour(commandContext)
{
    const args = commandContext.getCommandArgumentsArray();
    var elementsToShuffle = args;

    if (args.length <= 0)
        return commandContext.respondToCommand(new MessagePayload(`You must include a space-separated list of things to shuffle. These can be mentions to members in your game for a draft order.`));

    if (commandContext.isCommandInteraction() === true)
        elementsToShuffle = args[0].split(" ");

    return commandContext.getMentionedMembers()
    .then((members) =>
    {
        if (members != null && members.length > 0)
            elementsToShuffle = members.map((memberWrapper) => memberWrapper.getNameInGuild());
    
        elementsToShuffle = _shuffle(elementsToShuffle);
        return commandContext.respondToCommand(new MessagePayload(_list(elementsToShuffle).toBox(), "", true, "```"));
    });
}


function _shuffle(array)
{
    // Length is out of bounds but it's being compounded with
    // Math.floor(Math.random() * i), so it gets floored to last element
    var currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {

        // Pick a remaining element...
        const  randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // ...and swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

function _list(array)
{
    var str = "";
    array.forEach((elem, i) => str += `${i}. \t${elem}\n`);
    return str;
}