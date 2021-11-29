
const dice = require("../../dice.js");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("ROLL_DICE");

module.exports = RollDiceCommand;

function RollDiceCommand()
{
    const rollDiceCommand = new Command(commandData);

    rollDiceCommand.addBehaviour(_behaviour);

    return rollDiceCommand;
}

function _behaviour(commandContext)
{
    const diceInput = commandContext.getMessageContent().replace(/\s/, "");

    return commandContext.respondToCommand(new MessagePayload(dice.processRolls(diceInput)));
}