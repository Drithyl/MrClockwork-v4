
const log = require("../../logger.js");
const UserWrapper = require("../wrappers/user_wrapper.js");
const MessageWrapper = require("../wrappers/message_wrapper.js");
const BotClientWrapper = require("../wrappers/bot_client_wrapper.js");
const MessagePayload = require("../prototypes/message_payload.js");
const gamesStore = require("../../games/ongoing_games_store.js");

exports.startListening = () =>
{
    log.general(log.getNormalLevel(), "Listening to onReactionRemoved.");
    BotClientWrapper.addOnReactionRemovedHandler(_onReactionRemoved);
};

function _onReactionRemoved(discordJsMessageReaction, discordJsUser)
{
    const emoji = discordJsMessageReaction.emoji;
    const userWrapper = new UserWrapper(discordJsUser);
    const reactedMessageWrapper = new MessageWrapper(discordJsMessageReaction.message);
    const messageChannelId = reactedMessageWrapper.getDestinationChannelId();
    const gameHostedOnChannel = gamesStore.getOngoingGameByChannel(messageChannelId);

    if (userWrapper.isBot() === true)
        return;


    try
    {
        if (gameHostedOnChannel != null)
            _handleReactionRemovedOnGameChannel(emoji, reactedMessageWrapper, gameHostedOnChannel, userWrapper);
    }

    catch(err)
    {
        _handleReactionError(reactedMessageWrapper, err);
    }
}

async function _handleReactionRemovedOnGameChannel(emoji, reactedMessageWrapper, game, userWrapper)
{
    const userId = userWrapper.getId();

    if (emoji.name !== "📌" && emoji.name !== "📍" )
        return;

    if (game.getOrganizerId() !== userId)
        return;

    await reactedMessageWrapper.unpin();
}

function _handleReactionError(reactedMessageWrapper, err)
{
    log.error(log.getLeanLevel(), `Error on reaction removed`, err);
    return reactedMessageWrapper.respond(new MessagePayload(`Error occurred: ${err.message}`));
}