const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const TimeLeft = require("../../../games/prototypes/time_left.js");
const MessagePayload = require("../../prototypes/message_payload.js");

const CHECK_SUBCOMMAND_NAME = "check";
const SET_SUBCOMMAND_NAME = "set";
const ADD_SUBCOMMAND_NAME = "add";
const HOURS_OPTION = "hours";


module.exports = {
	data: new SlashCommandBuilder()
		.setName("dtimer")
		.setDescription("Check or change the default turn timer.")
        .addSubcommand(subcommand =>
            subcommand
                .setName(CHECK_SUBCOMMAND_NAME)
                .setDescription("Check the game's default timer")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName(ADD_SUBCOMMAND_NAME)
                .setDescription("Add time to the game's default timer.")
                .addIntegerOption(option =>
                    option.setName(HOURS_OPTION)
                    .setDescription("Hours to add to the default turn timer.")
                    .setMinValue(1)
                    .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName(SET_SUBCOMMAND_NAME)
                .setDescription("Set the game's default timer.")
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
    await commandPermissions.assertGameHasStarted(commandContext);
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);

    
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
    const gameSettings = gameObject.getSettingsObject();
    const timerSetting = gameSettings.getTimerSetting();
    const defaultTimeLeftObject = timerSetting.getValue();
    let payload;

    if (defaultTimeLeftObject.getMsLeft() === 0) {
        payload = new MessagePayload()
            .addEmbeds(
                new EmbedBuilder()
                    .setColor(0x6bb5f9)
                    .setDescription(`New turns have no time limit (paused).`)
            );
    }

    else {
        payload = new MessagePayload()
            .addEmbeds(
                new EmbedBuilder()
                    .setColor(0x6bb5f9)
                    .setDescription(`New turns have a timer of: ${defaultTimeLeftObject.printTimeLeft()}.`)
            );
    }

    return commandContext.respondToCommand(payload);
}

async function onSetSubcommand(commandContext)
{
    const gameObject = commandContext.targetedGame;
    const settingsObject = gameObject.getSettingsObject();
    const timerSetting = settingsObject.getTimerSetting();
    const hours = commandContext.options.getInteger(HOURS_OPTION);
    const msToSet = TimeLeft.hoursToMs(hours);

    await gameObject.changeTimer(msToSet, msToSet);

    const defaultTimeLeftObject = timerSetting.getValue();
    let payload;

    if (hours == 0) {
        payload = new MessagePayload()
            .addEmbeds(
                new EmbedBuilder()
                    .setColor(0x6bb5f9)
                    .setDescription(`The time per turn has been paused.`)
            );
    }

    else {
        payload = new MessagePayload()
            .addEmbeds(
                new EmbedBuilder()
                    .setColor(0x6bb5f9)
                    .setDescription(`New turns will be set to: ${defaultTimeLeftObject.printTimeLeft()}.`)
            );
    }

    return commandContext.respondToCommand(payload);
}

async function onAddSubcommand(commandContext)
{
    const gameObject = commandContext.targetedGame;
    const settingsObject = gameObject.getSettingsObject();
    const timerSetting = settingsObject.getTimerSetting();
    const defaultMsLeft = timerSetting.getValue().getMsLeft();
    const hours = commandContext.options.getInteger(HOURS_OPTION);
    const msToAdd = TimeLeft.hoursToMs(hours);
    const finalMsToSet = defaultMsLeft + msToAdd;

    await gameObject.changeTimer(finalMsToSet, finalMsToSet);

    const defaultTimeLeftObject = timerSetting.getValue();
    let payload;

    if (hours == 0) {
        payload = new MessagePayload()
            .addEmbeds(
                new EmbedBuilder()
                    .setColor(0x6bb5f9)
                    .setDescription(`The time per turn has been paused.`)
            );
    }

    else {
        payload = new MessagePayload()
            .addEmbeds(
                new EmbedBuilder()
                    .setColor(0x6bb5f9)
                    .setDescription(`New turns will be set to: ${defaultTimeLeftObject.printTimeLeft()}.`)
            );
    }

    return commandContext.respondToCommand(payload);
}
