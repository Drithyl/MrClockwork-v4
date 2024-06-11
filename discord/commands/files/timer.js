const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const TimeLeft = require("../../../games/prototypes/time_left.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const { dateToUnixTimestamp, unixTimestampToDynamicDisplay } = require("../../../utilities/formatting-utilities.js");
const { EMBED_COLOURS } = require("../../../constants/discord-constants.js");

const CHECK_SUBCOMMAND_NAME = "check";
const SET_SUBCOMMAND_NAME = "set";
const ADD_SUBCOMMAND_NAME = "add";
const HOURS_OPTION = "hours";
const MINUTES_OPTION = "minutes";


module.exports = {
	data: new SlashCommandBuilder()
		.setName("timer")
		.setDescription("Check or change the timer of the current turn.")
        .addSubcommand(subcommand =>
            subcommand
                .setName(CHECK_SUBCOMMAND_NAME)
                .setDescription("Check the game's current timer")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName(ADD_SUBCOMMAND_NAME)
                .setDescription("Add time to the game's current timer.")
                .addIntegerOption(option =>
                    option.setName(HOURS_OPTION)
                    .setDescription("Hours to add to the current turn timer.")
                    .setMinValue(0)
                    .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName(MINUTES_OPTION)
                    .setDescription("Minutes to add to the current turn timer.")
                    .setMinValue(1)
                    .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName(SET_SUBCOMMAND_NAME)
                .setDescription("Set the game's current timer.")
                .addIntegerOption(option =>
                    option.setName(HOURS_OPTION)
                    .setDescription("Hours for a new turn to roll.")
                    .setMinValue(0)
                    .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName(MINUTES_OPTION)
                    .setDescription("Minutes for a new turn to roll.")
                    .setMinValue(1)
                    .setRequired(false)
                )
        )
        .setDMPermission(false),

	execute: behaviour
};

async function behaviour(commandContext)
{
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);
    await commandPermissions.assertGameHasStarted(commandContext);

    
    if (commandContext.options.getSubcommand() === CHECK_SUBCOMMAND_NAME)
        return onCheckSubcommand(commandContext);


    await commandPermissions.assertMemberIsOrganizer(commandContext);
    

    if (commandContext.options.getSubcommand() === SET_SUBCOMMAND_NAME)
        return onSetSubcommand(commandContext);

    else if (commandContext.options.getSubcommand() === ADD_SUBCOMMAND_NAME)
        return onAddSubcommand(commandContext);
}

function onCheckSubcommand(commandContext)
{
    const gameObject = commandContext.targetedGame;
    const lastKnownStatus = gameObject.getLastKnownStatus();
    const timeLeft = lastKnownStatus.getTimeLeft();
    const dateWhenTurnWillRoll = timeLeft.toDateObject();
    const unixTimestamp = dateToUnixTimestamp(dateWhenTurnWillRoll);

    return commandContext.respondToCommand(
        new MessagePayload()
            .addEmbeds(
                new EmbedBuilder()
                    .setColor(EMBED_COLOURS.INFO)
                    .setDescription(`Next Turn:\n\n${unixTimestampToDynamicDisplay(unixTimestamp)},\nin ${timeLeft.printTimeLeft()}.`)
            )
    );
}

async function onSetSubcommand(commandContext)
{
    const gameObject = commandContext.targetedGame;
    const role = gameObject.getRole();
    const roleStr = (role != null) ? role.toString() : "`[No game role found to mention]`";
    const lastKnownStatus = gameObject.getLastKnownStatus();
    const hours = commandContext.options.getInteger(HOURS_OPTION);
    const minutes = commandContext.options.getInteger(MINUTES_OPTION);
    const msToSet = TimeLeft.hoursToMs(hours) + TimeLeft.minutesToMs(minutes);

    if (msToSet <= 0) {
        return commandContext.respondToCommand("Why are you trying to set a timer of 0 or less? Use `/pause` if you'd like to pause the timer.");
    }

    await gameObject.changeTimer(msToSet);

    const timeLeft = lastKnownStatus.getTimeLeft();
    const dateWhenTurnWillRoll = timeLeft.toDateObject();
    const unixTimestamp = dateToUnixTimestamp(dateWhenTurnWillRoll);

    return commandContext.respondToCommand(
        new MessagePayload(roleStr)
            .addEmbeds(
                new EmbedBuilder()
                    .setColor(EMBED_COLOURS.INFO)
                    .setDescription(`The timer was changed. Next Turn will now process on:\n\n${unixTimestampToDynamicDisplay(unixTimestamp)},\nin ${timeLeft.printTimeLeft()}.`)
            )
    );
}

async function onAddSubcommand(commandContext)
{
    const gameObject = commandContext.targetedGame;
    const role = gameObject.getRole();
    const roleStr = (role != null) ? role.toString() : "`[No game role found to mention]`";
    const lastKnownStatus = gameObject.getLastKnownStatus();
    const msLeft = lastKnownStatus.getMsLeft();
    const hours = commandContext.options.getInteger(HOURS_OPTION);
    const minutes = commandContext.options.getInteger(MINUTES_OPTION);
    const msToAdd = TimeLeft.hoursToMs(hours) + TimeLeft.minutesToMs(minutes);

    if (msToAdd <= 0) {
        return commandContext.respondToCommand("You need to add at least one minute to the timer.");
    }


    await gameObject.changeTimer(msLeft + msToAdd);

    const timeLeft = lastKnownStatus.getTimeLeft();
    const dateWhenTurnWillRoll = timeLeft.toDateObject();
    const unixTimestamp = dateToUnixTimestamp(dateWhenTurnWillRoll);

    return commandContext.respondToCommand(
        new MessagePayload(roleStr)
            .addEmbeds(
                new EmbedBuilder()
                    .setColor(EMBED_COLOURS.INFO)
                    .setDescription(`The timer was changed. Next Turn will now process on:\n\n${unixTimestampToDynamicDisplay(unixTimestamp)},\nin ${timeLeft.printTimeLeft()}.`)
            )
    );
}
