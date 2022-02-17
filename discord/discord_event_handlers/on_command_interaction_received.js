
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
    log.command(log.getNormalLevel(), commandInteractionWrapper);
    
    try
    {
        commandInteractionWrapper.deferReply()
        .then(() => commandStore.invokeCommandInteraction(commandInteractionWrapper))
        .catch((err) => 
        {
            _handleCommandInteractionError(commandInteractionWrapper, err)
        });
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
        log.general(log.getNormalLevel(), `SemanticError: ${err.message}`);
        return commandInteractionWrapper.respondToCommand(new MessagePayload(`Invalid command format: ${err.message}`));
    }

    if (assert.isPermissionsError(err) === true)
    {
        log.general(log.getNormalLevel(), `PermissionsError: ${err.message}`);
        return commandInteractionWrapper.respondToCommand(new MessagePayload(err.message));
    }

    else
    {
        log.error(log.getLeanLevel(), `ERROR HANDLING COMMAND`, err);
        return commandInteractionWrapper.respondToCommand(new MessagePayload(`Interaction Error occurred: ${err.message}\n\n${err.stack}`));
    }
}