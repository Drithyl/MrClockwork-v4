
const log = require("../../logger.js");
const assert = require("../../asserter.js");
const commandStore = require("../command_store");
const MessageWrapper = require("../wrappers/message_wrapper.js");
const CommandContext = require("../prototypes/command_context.js");
const activeMenuStore = require("../../menus/active_menu_store.js");
const BotClientWrapper = require("../wrappers/bot_client_wrapper.js");
const MessagePayload = require("../prototypes/message_payload.js");

exports.startListening = () =>
{
    log.general(log.getNormalLevel(), "Listening to onMessageReceived.");
    BotClientWrapper.addOnMessageReceivedHandler(_onMessageReceived);
};

async function _onMessageReceived(discordJsMessage)
{
    var messageWrapper = new MessageWrapper(discordJsMessage);
    var senderId = messageWrapper.getSenderId();

    if (messageWrapper.startsWithCommandPrefix() === true)
    {
        const context = new CommandContext(messageWrapper);
        const command = commandStore.getInvokedCommand(context);

        if (command == null)
            return;
        
        try
        {
            log.command(log.getNormalLevel(), context);
            await command.invoke(context);
        }

        catch(err)
        {
            _handleCommandError(messageWrapper, err);
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
    if (assert.isSemanticError(err) === true)
    {
        log.general(log.getNormalLevel(), err.message);
        return messageWrapper.respond(new MessagePayload(`Invalid command format: ${err.message}`));
    }

    if (assert.isPermissionsError(err) === true)
    {
        log.general(log.getNormalLevel(), err.message);
        return messageWrapper.respond(new MessagePayload(err.message));
    }

    else
    {
        log.error(log.getLeanLevel(), `ERROR HANDLING COMMAND`, err);
        return messageWrapper.respond(new MessagePayload(`Message Error occurred: ${err.message}`));
    }
}