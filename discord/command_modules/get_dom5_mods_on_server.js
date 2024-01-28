
const asserter = require("../../asserter.js");
const config = require("../../config/config.json");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const hostServerStore = require("../../servers/host_server_store.js");
const MessagePayload = require("../prototypes/message_payload.js");

const commandData = new CommandData("GET_MODS_ON_SERVER");

module.exports = GetModsOnServerCommand;

function GetModsOnServerCommand()
{
    const getModsOnServerCommand = new Command(commandData);

    getModsOnServerCommand.addBehaviour(_behaviour);

    return getModsOnServerCommand;
}

async function _behaviour(commandContext)
{
    const commandArguments = commandContext.getCommandArgumentsArray();
    const gameType = commandArguments[0];

    if (asserter.isValidGameType(gameType) === false)
        return commandContext.respondToCommand(new MessagePayload(`You must specify the game for which you want to get a list of mods. Either ${config.dom5GameTypeName} or ${config.dom6GameTypeName}`));

    const payload = new MessagePayload(`Attached below is the list of ${gameType} mods available:\n\n`);
    const mods = await hostServerStore.getMods(gameType);

    if (mods.length <= 0)
        return commandContext.respondToCommand(new MessagePayload(`No ${gameType} mods are available. You'll have to upload some with the corresponding command.`));

    payload.setAttachment("mods.txt", Buffer.from(mods.join("\n")));

    return commandContext.respondToCommand(payload);
}
