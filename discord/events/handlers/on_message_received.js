const log = require("../../../logger.js");
const assert = require("../../../asserter.js");
const MessageWrapper = require("../../wrappers/message_wrapper.js");
const activeMenuStore = require("../../../menus/active_menu_store.js");
const MessagePayload = require("../../prototypes/message_payload.js");

module.exports =
{
    name: "messageCreate",
    execute: (message) =>
    {
        const messageWrapper = new MessageWrapper(message);
        const senderId = messageWrapper.getSenderId();


        if (messageWrapper.wasSentByBot() === true)
            return;

        if (activeMenuStore.isUserInMenu(senderId) === false)
            return;

        if (messageWrapper.isDirectMessage() === false)
            return;

        
        try
        {
            activeMenuStore.handleInput(senderId, messageWrapper);
        }

        catch(err)
        {
            _handleCommandError(messageWrapper, err);
        }
    }
};

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