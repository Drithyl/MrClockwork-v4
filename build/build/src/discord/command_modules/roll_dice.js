"use strict";
var dice = require("../../dice.js");
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var commandData = new CommandData("ROLL_DICE");
module.exports = RollDiceCommand;
function RollDiceCommand() {
    var rollDiceCommand = new Command(commandData);
    rollDiceCommand.addBehaviour(_behaviour);
    rollDiceCommand.addRequirements(commandPermissions.assertMemberIsTrusted);
    return rollDiceCommand;
}
function _behaviour(commandContext) {
    var diceInput = commandContext.getMessageContent().replace(/\s/, "");
    return commandContext.respondToCommand(dice.processRolls(diceInput));
}
//# sourceMappingURL=roll_dice.js.map