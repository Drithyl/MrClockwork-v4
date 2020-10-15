"use strict";
var assert = require("../../asserter.js");
var commandStore = require("../command_store");
var MessageWrapper = require("../wrappers/message_wrapper.js");
var CommandContext = require("../prototypes/command_context.js");
var activeMenuStore = require("../../menus/active_menu_store.js");
var BotClientWrapper = require("../wrappers/bot_client_wrapper.js");
exports.startListening = function () {
    console.log("Listening to onMessageReceived.");
    BotClientWrapper.addOnMessageReceivedHandler(_onMessageReceived);
};
function _onMessageReceived(discordJsMessage) {
    var messageWrapper = new MessageWrapper(discordJsMessage);
    var senderId = messageWrapper.getSenderId();
    if (messageWrapper.startsWithCommandPrefix() === true) {
        var context = new CommandContext(messageWrapper);
        if (commandStore.isCommandInvoked(context) === true) {
            try {
                commandStore.invokeCommand(context)
                    .catch(function (err) { return _handleCommandError(messageWrapper, err); });
            }
            catch (err) {
                _handleCommandError(messageWrapper, err);
            }
        }
    }
    else if (activeMenuStore.isUserInMenu(senderId) === true) {
        try {
            activeMenuStore.handleInput(senderId, messageWrapper);
        }
        catch (err) {
            _handleCommandError(messageWrapper, err);
        }
    }
}
function _handleCommandError(messageWrapper, err) {
    if (assert.isSemanticError(err) === true) {
        console.log("Invalid command format: " + err.message);
        return messageWrapper.respond("Invalid command format: " + err.message);
    }
    if (assert.isPermissionsError(err) === true) {
        console.log("Invalid command permissions: " + err.message);
        return messageWrapper.respond("Invalid permissions: " + err.message);
    }
    else {
        console.log(err);
        return messageWrapper.respond("Error occurred: " + err.message);
    }
}
//# sourceMappingURL=on_message_received.js.map