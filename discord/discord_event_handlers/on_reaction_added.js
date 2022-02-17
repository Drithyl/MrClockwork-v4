
const log = require("../../logger.js");
const UserWrapper = require("../wrappers/user_wrapper.js");
const MessageWrapper = require("../wrappers/message_wrapper.js");
const activeMenuStore = require("../../menus/active_menu_store.js");
const BotClientWrapper = require("../wrappers/bot_client_wrapper.js");
const MessagePayload = require("../prototypes/message_payload.js");
const gamesStore = require("../../games/ongoing_games_store.js");

exports.startListening = () =>
{
    log.general(log.getNormalLevel(), "Listening to onReactionAdded.");
    BotClientWrapper.addOnReactionAddedHandler(_onReactionAdded);
};

function _onReactionAdded(discordJsMessageReaction, discordJsUser)
{
    const emoji = discordJsMessageReaction.emoji;
    const userWrapper = new UserWrapper(discordJsUser);
    const reactedMessageWrapper = new MessageWrapper(discordJsMessageReaction.message);
    const messageChannelId = reactedMessageWrapper.getDestinationChannelId();
    const gameHostedOnChannel = gamesStore.getOngoingGameByChannel(messageChannelId);
    const userId = userWrapper.getId();

    if (userWrapper.isBot() === true)
        return;


    try
    {
        if (gameHostedOnChannel != null)
            _handleReactionOnGameChannel(emoji, reactedMessageWrapper, gameHostedOnChannel, userWrapper);

        else if (reactedMessageWrapper.isDirectMessage() === true) 
            activeMenuStore.handleReaction(userId, emoji, reactedMessageWrapper);
    }

    catch(err)
    {
        _handleReactionError(reactedMessageWrapper, err);
    }
}

async function _handleReactionOnGameChannel(emoji, reactedMessageWrapper, game, userWrapper)
{
    const userId = userWrapper.getId();

    if (emoji.name !== "📌" && emoji.name !== "📍" )
        return;

    if (game.getOrganizerId() !== userId)
        return;

    await reactedMessageWrapper.pin();
}

function _handleReactionError(reactedMessageWrapper, err)
{
    log.error(log.getLeanLevel(), `Error on reaction added`, err);
    return reactedMessageWrapper.respond(new MessagePayload(`Error occurred: ${err.message}`));
}