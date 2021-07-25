
const log = require("../../logger.js");
const UserWrapper = require("../wrappers/user_wrapper.js");
const MessageWrapper = require("../wrappers/message_wrapper.js");
const activeMenuStore = require("../../menus/active_menu_store.js");
const BotClientWrapper = require("../wrappers/bot_client_wrapper.js");

exports.startListening = () =>
{
    log.general(log.getNormalLevel(), "Listening to onReactionAdded.");
    BotClientWrapper.addOnReactionAddedHandler(_onReactionAdded);
};

function _onReactionAdded(discordJsMessageReaction, discordJsUser)
{
    var userWrapper = new UserWrapper(discordJsUser);
    var reactedMessageWrapper = new MessageWrapper(discordJsMessageReaction.message);
    var userId = userWrapper.getId();

    if (userWrapper.isBot() === true)
        return;

    if (reactedMessageWrapper.isDirectMessage() === false)
        return;

    try
    {
        activeMenuStore.handleReaction(userId, discordJsMessageReaction.emoji, reactedMessageWrapper);
    }

    catch(err)
    {
        _handleReactionError(reactedMessageWrapper, err);
    }
}

function _handleReactionError(reactedMessageWrapper, err)
{
    log.error(log.getLeanLevel(), `ERROR HANDLING COMMAND`, err);
    return reactedMessageWrapper.respond(`Error occurred: ${err.message}`);
}