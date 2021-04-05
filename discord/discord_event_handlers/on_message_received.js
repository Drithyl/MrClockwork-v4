
const log = require("../../logger.js");
const assert = require("../../asserter.js");
const commandStore = require("../command_store");
const MessageWrapper = require("../wrappers/message_wrapper.js");
const CommandContext = require("../prototypes/command_context.js");
const activeMenuStore = require("../../menus/active_menu_store.js");
const BotClientWrapper = require("../wrappers/bot_client_wrapper.js");

exports.startListening = () =>
{
    log.general(log.getNormalLevel(), "Listening to onMessageReceived.");
    BotClientWrapper.addOnMessageReceivedHandler(_onMessageReceived);
};

function _onMessageReceived(discordJsMessage)
{
    var messageWrapper = new MessageWrapper(discordJsMessage);
    var senderId = messageWrapper.getSenderId();

    if (messageWrapper.startsWithCommandPrefix() === true)
    {
        var context = new CommandContext(messageWrapper);
        
        if (commandStore.isCommandInvoked(context) === true)
        {
            try
            {
                commandStore.invokeCommand(context)
                .catch((err) => _handleCommandError(messageWrapper, err));
            }

            catch(err)
            {
                _handleCommandError(messageWrapper, err);
            }
        }
    }

    else if (activeMenuStore.isUserInMenu(senderId) === true && messageWrapper.isDirectMessage() === true)
    {
        try
        {
            activeMenuStore.handleInput(senderId, messageWrapper);
        }

        catch(err)
        {
            _handleCommandError(messageWrapper, err);
        }
        
    }
}

function _handleCommandError(messageWrapper, err)
{
    console.log(err);
    if (assert.isSemanticError(err) === true)
    {
        log.general(log.getNormalLevel(), `Invalid command format by user`, err.message);
        return messageWrapper.respond(`Invalid command format: ${err.message}`);
    }

    if (assert.isPermissionsError(err) === true)
    {
        log.general(log.getNormalLevel(), `Invalid command permissions on user`, err.message);
        return messageWrapper.respond(`Invalid permissions: ${err.message}`);
    }

    else
    {
        log.error(log.getLeanLevel(), `ERROR HANDLING COMMAND`, err);
        return messageWrapper.respond(`Error occurred: ${err.message}`);
    }
}