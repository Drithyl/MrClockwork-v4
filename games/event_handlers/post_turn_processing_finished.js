
const log = require("../../logger.js");
const { EmbedBuilder } = require("discord.js");
const MessagePayload = require("../../discord/prototypes/message_payload.js");
const { EMBED_COLOURS } = require("../../constants/discord-constants.js");


module.exports = (game, statusdump, error) =>
{
    const status = game.getLastKnownStatus();
    const channel = game.getChannel();
    const embeds = [];

    // Update the game's status to reflect the new turn
    status.setHasStarted(true);
    status.setLastTurnTimestamp(Date.now());
    status.setMsToDefaultTimer(game);
    status.setIsTurnProcessing(false);
    status.setIsCurrentTurnRollback(false);

    embeds.push(_processBackup(game, statusdump, error));

    if (error == null && statusdump != null) {
        embeds.push(_processStaleData(statusdump));
    }

    new MessagePayload()
            .addEmbeds(embeds)
            .send(channel);
};

function _processBackup(game, statusdump, error)
{
    const gameName = game.getName();

    if (error)
    {
        log.error(log.getLeanLevel(), `${gameName}: Post-turn backup encountered error`, error);
        return new EmbedBuilder()
            .setColor(EMBED_COLOURS.ERROR)
            .setDescription(`**__Post-turn backup encountered an error__**. If the next pre-turn backup fails, rollback to this turn might not be available. Stale data won't be available for this turn either.\n\n\`\`\`     ${error}\`\`\``);
    }

    else
    {
        log.general(log.getNormalLevel(), `${gameName}: Post-turn ${statusdump.turnNumber} backup finished!`);
        return new EmbedBuilder()
                .setColor(EMBED_COLOURS.SUCCESS)
                .setDescription("Post-turn backup successful.");
    }
}

function _processStaleData(statusdump)
{
    const nationStatuses = statusdump.nationStatuses;
    const stales = _calculateStales(nationStatuses);
    const formattedStaleData = _formatStaleDataIntoString(stales);
    return new EmbedBuilder()
            .setColor((stales.length > 0) ? EMBED_COLOURS.ERROR : EMBED_COLOURS.SUCCESS)
            .setDescription(`__**Stales this turn:**__\n\n${formattedStaleData}`);
}

function _calculateStales(nationStatuses = [])
{
    const stales = nationStatuses.filter((s) => {
        return s.isHuman === true && s.wasTurnChecked === false;
    });

    return stales;
}

function _formatStaleDataIntoString(stales = [])
{
    if (stales.length === 0)
        return "No nation staled";

    return stales.map((s) => s.fullName).join("\n").toBox();
}