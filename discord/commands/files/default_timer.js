const { SlashCommandBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const TimeLeft = require("../../../games/prototypes/time_left.js");
const MessagePayload = require("../../prototypes/message_payload.js");

const CHECK_SUBCOMMAND_NAME = "check";
const SET_SUBCOMMAND_NAME = "set";
const ADD_SUBCOMMAND_NAME = "add";
const HOURS_SET_OPTION = "hour_to_set";
const HOURS_ADD_OPTION = "hour_to_add";


module.exports = {
	data: new SlashCommandBuilder()
		.setName("dtimer")
		.setDescription("Check or change the default turn timer.")
        .addSubcommandGroup(subcommandGroup =>
            subcommandGroup.setName(CHECK_SUBCOMMAND_NAME)
            .setDescription("Check the the default turn timer.")
        )

        .addSubcommandGroup(subcommandGroup =>
            subcommandGroup.setName("change")
            .setDescription("Set a new default turn timer or add more time to it.")
            .addSubcommand(subcommand =>
                subcommand.setName(SET_SUBCOMMAND_NAME)
                .setDescription("Set a default turn timer.")
                .addIntegerOption(option =>
                    option.setName(HOURS_SET_OPTION)
                    .setDescription("Hours for a new turn to roll.")
                    .setMinValue(1)
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand =>
                subcommand.setName(ADD_SUBCOMMAND_NAME)
                .setDescription("Add more time to the default turn timer.")
                .addIntegerOption(option =>
                    option.setName(HOURS_ADD_OPTION)
                    .setDescription("Hours to add to the default turn timer.")
                    .setMinValue(1)
                    .setRequired(true)
                )
            )
        ),

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
    const gameSettings = gameObject.getSettingsObject();
    const timerSetting = gameSettings.getTimerSetting();
    const defaultTimeLeftObject = timerSetting.getValue();
    

    if (defaultTimeLeftObject.getMsLeft() === 0)
        return commandContext.respondToCommand(new MessagePayload(`Default timer: **paused**.`));

    return commandContext.respondToCommand(new MessagePayload(
        `Default timer: ${defaultTimeLeftObject.printTimeLeft()}.`
    ));
}

async function onSetSubcommand(commandContext)
{
    const gameObject = commandContext.targetedGame;
    const settingsObject = gameObject.getSettingsObject();
    const timerSetting = settingsObject.getTimerSetting();
    const hours = commandContext.options.getInteger(HOURS_SET_OPTION);
    const msToSet = TimeLeft.hoursToMs(hours);

    await gameObject.changeTimer(msToSet, msToSet);

    if (hours == 0)
        return commandContext.respondToCommand(new MessagePayload(`The time per turn has been paused. It may take a minute to update.`));

    else return commandContext.respondToCommand(new MessagePayload(
            `The time per turn was changed. New turns will now have ${timerSetting.getValue().printTimeLeft()}.`
    ));
}

async function onAddSubcommand(commandContext)
{
    const gameObject = commandContext.targetedGame;
    const settingsObject = gameObject.getSettingsObject();
    const timerSetting = settingsObject.getTimerSetting();
    const defaultMsLeft = timerSetting.getValue().getMsLeft();
    const hours = commandContext.options.getInteger(HOURS_SET_OPTION);
    const msToAdd = TimeLeft.hoursToMs(hours);
    const finalMsToSet = defaultMsLeft + msToAdd;

    await gameObject.changeTimer(finalMsToSet, finalMsToSet);

    if (hours == 0)
        return commandContext.respondToCommand(new MessagePayload(`The time per turn has been paused. It may take a minute to update.`));

    else return commandContext.respondToCommand(new MessagePayload(
            `The time per turn was changed. New turns will now have ${timerSetting.getValue().printTimeLeft()}.`
    ));
}