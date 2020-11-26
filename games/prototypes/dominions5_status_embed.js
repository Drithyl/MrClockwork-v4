
const asserter = require("../../asserter");
const messenger = require("../../discord/messenger.js");
const MessageWrapper = require("../../discord/wrappers/message_wrapper.js");
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

    if (channel == null)
        throw new Error(`${gameName} has no channel; cannot send status embed.`);

    embedBuild.setTitle(gameName);
    embedBuild.setDescription(`Below is the current status of the game.`);

    embedBuild.addField(STATUS_HEADER, "waiting for pretenders", true);
    embedBuild.addField(TURN_HEADER, "N/A", true);
    embedBuild.addField(TIMER_HEADER, "N/A", true);
    embedBuild.addField(UNDONE_TURNS_HEADER, "N/A");

    return messenger.send(channel, `${gameName}'s status:`, { embed: embedBuild.toEmbedStruct(), pin: true })
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
    if (asserter.isInstanceOfPrototypeOrThrow(embedWrapper, MessageEmbedWrapper));

    const _embed = embedWrapper;

    this.getMessageId = () => embedWrapper.getMessageId();

    this.update = (updateData) =>
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


            if (asserter.isInteger(updateData.turnNumber) === true)
                _embed.replaceField(1, TURN_HEADER, updateData.turnNumber, true);

            else _embed.replaceField(1, TURN_HEADER, "unavailable", true);


            if (updateData.msLeft === 0)
                _embed.editField(2, TIMER_HEADER, "paused");

            else if (asserter.isInteger(updateData.msLeft) === true)
                _embed.editField(2, TIMER_HEADER, timeLeft.printTimeLeftShort());

            else _embed.editField(2, TIMER_HEADER, "unavailable");


            if (asserter.isArray(updateData.players) === true)
            {
                const playerStr = updateData.players.reduce((playersInfo, playerData) => 
                {
                    if (playerData.isTurnDone === false)
                        return playersInfo + `${playerData.name}\n`;

                    else return playersInfo;
                }, "\n");

                _embed.editField(3, UNDONE_TURNS_HEADER, playerStr);
            }

            else _embed.editField(3, UNDONE_TURNS_HEADER, "unavailable");
        }

        else _embed.editField(0, STATUS_HEADER, updateData.status, true);


        return _embed.update();
    };
    
}