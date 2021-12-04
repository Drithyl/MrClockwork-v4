
const asserter = require("../../asserter");
const MessageWrapper = require("../../discord/wrappers/message_wrapper.js");
const MessagePayload = require("../../discord/prototypes/message_payload.js");
const MessageEmbedBuilder = require("../../discord/wrappers/message_embed_builder.js");
const MessageEmbedWrapper = require("../../discord/wrappers/message_embed_wrapper.js");


const STATUS_HEADER = "Status:";
const TURN_HEADER = "Last known turn:";
const TIMER_HEADER = "Last known time left:";
const UNDONE_TURNS_HEADER = "Last known undone turns:";


module.exports = Dominions5StatusEmbed;


Dominions5StatusEmbed.sendNew = (game) =>
{
    const gameName = game.getName();
    const channel = game.getChannel();
    const embedBuild = new MessageEmbedBuilder();
    const payload = new MessagePayload(`${gameName}'s status:`);

    if (channel == null)
        throw new Error(`${gameName} has no channel; cannot send status embed.`);

    embedBuild.setTitle(gameName);
    embedBuild.setDescription(`Below is the current status of the game.`);

    embedBuild.addField(STATUS_HEADER, "waiting for pretenders", true);
    embedBuild.addField(TURN_HEADER, "N/A", true);
    embedBuild.addField(TIMER_HEADER, "N/A", true);
    embedBuild.addField(UNDONE_TURNS_HEADER, "N/A");

    payload.setEmbed(embedBuild);

    return payload.send(channel, { pin: true })
    .then((messageWrapper) => 
    {
        const embedWrapper = messageWrapper.getEmbedWrapper(0);
        return Promise.resolve(new Dominions5StatusEmbed(embedWrapper));
    })
    .catch((err) => Promise.reject(err));
};

Dominions5StatusEmbed.loadExisting = (channel, messageId) => 
{
    return MessageWrapper.fetchFromChannel(channel, messageId)
    .then((messageWrapper) => 
    {
        const embedWrapper = messageWrapper.getEmbedWrapper();
        return Promise.resolve(new Dominions5StatusEmbed(embedWrapper));
    })
    .catch((err) => Promise.reject(new Error(`Could not load existing status message: ${err.message}`)));
};


function Dominions5StatusEmbed(embedWrapper)
{
    asserter.isInstanceOfPrototypeOrThrow(embedWrapper, MessageEmbedWrapper);

    const _embed = embedWrapper;

    this.getMessageId = () => embedWrapper.getMessageId();

    // updateData is an instance of Dominions5Status, enhanced with some new 
    // boolean event properties which stem from the game_monitor.js code
    this.update = (game, updateData, isBotEnforced = true) =>
    {
        const timeLeft = updateData.getTimeLeft();

        if (updateData.isInLobby() === true)
        {
            _embed.editField(0, STATUS_HEADER, "waiting for pretenders", true);

            if (updateData.didGameRestart === true)
                _embed.removeFields(1, 3);
        }

        else if (updateData.isOngoing() === true)
        {
            _embed.replaceField(0, STATUS_HEADER, "online", true);


            if (asserter.isInteger(updateData.getTurnNumber()) === true)
                _embed.replaceField(1, TURN_HEADER, updateData.getTurnNumber(), true);

            else _embed.replaceField(1, TURN_HEADER, "unavailable", true);


            if (game.isCurrentTurnRollback() === true)
                _embed.editField(2, TIMER_HEADER, `rollback turn; must be force hosted to roll`);

            else if (updateData.isPaused() === true)
                _embed.editField(2, TIMER_HEADER, `paused ${(isBotEnforced) ? "(bot-enforced)" : "(game-enforced)"}`);

            else if (asserter.isInteger(updateData.getMsLeft()) === true)
                _embed.editField(2, TIMER_HEADER, `${timeLeft.printTimeLeftShort()} ${(isBotEnforced) ? "(bot-enforced)" : "(game-enforced)"}`);

            else _embed.editField(2, TIMER_HEADER, `unavailable ${(isBotEnforced) ? "(bot-enforced)" : "(game-enforced)"}`);


            if (asserter.isArray(updateData.getPlayers()) === true)
            {
                if (updateData.areAllTurnsDone() === true)
                    _embed.editField(3, UNDONE_TURNS_HEADER, `all turns done`);

                else
                {
                    const playerStr = updateData.getPlayers().reduce((playersInfo, playerData) => 
                    {
                        if (playerData.isTurnFinished === false && playerData.isHuman === true)
                            return playersInfo + `${playerData.fullName}\n`;

                        else return playersInfo;
                    }, "\n");

                    _embed.editField(3, UNDONE_TURNS_HEADER, playerStr);
                }
            }

            else _embed.editField(3, UNDONE_TURNS_HEADER, "unavailable");
        }

        else _embed.editField(0, STATUS_HEADER, updateData.getStatus(), true);

        return _embed.update();
    };
    
}