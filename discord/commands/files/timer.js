const { SlashCommandBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const TimeLeft = require("../../../games/prototypes/time_left.js");
const MessagePayload = require("../../prototypes/message_payload.js");

const CHECK_SUBCOMMAND_NAME = "check";
const SET_SUBCOMMAND_NAME = "set";
const ADD_SUBCOMMAND_NAME = "add";
const HOURS_OPTION = "hours";


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
                    .setMinValue(1)
                    .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName(SET_SUBCOMMAND_NAME)
                .setDescription("Set the game's current timer.")
                .addIntegerOption(option =>
                    option.setName(HOURS_OPTION)
                    .setDescription("Hours for a new turn to roll.")
                    .setMinValue(1)
                    .setRequired(true)
                )
        )
        .setDMPermission(false),

	execute: behaviour
};

async function behaviour(commandContext)
{
    await commandPermissions.assertGameHasStarted(commandContext);(commandContext);
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);(commandContext);

    
    if (commandContext.options.getSubcommand() === CHECK_SUBCOMMAND_NAME)
        return onCheckSubcommand(commandContext);


    await commandPermissions.assertMemberIsOrganizer(commandContext);(commandContext);
    

    if (commandContext.options.getSubcommand() === SET_SUBCOMMAND_NAME)
        return onSetSubcommand(commandContext);

    else if (commandContext.options.getSubcommand() === ADD_SUBCOMMAND_NAME)
        return onAddSubcommand(commandContext);
}

function onCheckSubcommand(commandContext)
{
    const gameObject = commandContext.targetedGame;
    const lastKnownStatus = gameObject.getLastKnownStatus();

    return commandContext.respondToCommand(
        new MessagePayload(`Current time left: ${lastKnownStatus.printTimeLeft()}.`)
    );
}

async function onSetSubcommand(commandContext)
{
    const gameObject = commandContext.targetedGame;
    const lastKnownStatus = gameObject.getLastKnownStatus();
    const hours = commandContext.options.getInteger(HOURS_OPTION);
    const msToSet = TimeLeft.hoursToMs(hours);

    await gameObject.changeTimer(msToSet);
    return commandContext.respondToCommand(
        new MessagePayload(`The timer was changed. New timer: ${lastKnownStatus.printTimeLeft()}.`)
    );
}

async function onAddSubcommand(commandContext)
{
    const gameObject = commandContext.targetedGame;
    const lastKnownStatus = gameObject.getLastKnownStatus();
    const msLeft = lastKnownStatus.getMsLeft();
    const hours = commandContext.options.getInteger(HOURS_OPTION);
    const msToAdd = TimeLeft.hoursToMs(hours);

    await gameObject.changeTimer(msLeft + msToAdd);
    return commandContext.respondToCommand(
        new MessagePayload(`The time was added. New timer: ${lastKnownStatus.printTimeLeft()}.`)
    );
}
