
const log = require("../../logger.js");
const assert = require("../../asserter.js");
const commandStore = require("../command_store");
const MessagePayload = require("../prototypes/message_payload.js");
const BotClientWrapper = require("../wrappers/bot_client_wrapper.js");
const CommandInteractionWrapper = require("../wrappers/command_interaction_wrapper.js");

exports.startListening = () =>
{
    log.general(log.getNormalLevel(), "Listening to onCommandInteractionReceived.");
    BotClientWrapper.addOnCommandInteractionReceivedHandler(_onCommandInteractionReceived);
};

function _onCommandInteractionReceived(discordJsInteraction)
{
    var commandInteractionWrapper = new CommandInteractionWrapper(discordJsInteraction);
    
    try
    {
        commandStore.invokeCommandInteraction(commandInteractionWrapper)
        .catch((err) => _handleCommandInteractionError(commandInteractionWrapper, err));
    }

    catch(err)
    {
        _handleCommandInteractionError(commandInteractionWrapper, err);
    }
}

function _handleCommandInteractionError(commandInteractionWrapper, err)
{
    if (assert.isSemanticError(err) === true)
    {
        log.general(log.getNormalLevel(), `Invalid command format by user`, err);
        return commandInteractionWrapper.respondToSender(new MessagePayload(`Invalid command format: ${err.message}`));
    }

    if (assert.isPermissionsError(err) === true)
    {
        log.general(log.getNormalLevel(), `Invalid command permissions on user`, err);
        return commandInteractionWrapper.respondToSender(new MessagePayload(`Invalid permissions: ${err.message}`));
    }

    else
    {
        log.error(log.getLeanLevel(), `ERROR HANDLING COMMAND`, err);
        return commandInteractionWrapper.respondToSender(new MessagePayload(`Error occurred: ${err.message}`));
    }
}