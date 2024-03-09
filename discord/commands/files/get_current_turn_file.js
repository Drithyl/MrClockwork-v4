
const { SlashCommandBuilder } = require("discord.js");
const commandPermissions = require("../../command_permissions.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const playerFileStore = require("../../../player_data/player_file_store.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("turn_file")
		.setDescription("[Game-player-only] Requests the claimed nation's current turn file, which is then sent by DM."),

	execute: behaviour
};

async function behaviour(commandContext)
{
    await commandPermissions.assertMemberIsTrusted(commandContext);
    await commandPermissions.assertCommandIsUsedInGameChannel(commandContext);
    await commandPermissions.assertMemberIsPlayer(commandContext);
    await commandPermissions.assertServerIsOnline(commandContext);
    await commandPermissions.assertGameHasStarted(commandContext);

    const gameObject = commandContext.targetedGame;
    const gameName = gameObject.getName();
    const status = gameObject.getLastKnownStatus();
    const messageString = `${gameName}'s turn ${status.getTurnNumber()}:`;

    const playerId = commandContext.userId;
    const playerFile = playerFileStore.getPlayerFile(playerId);
    const playerGameData = playerFile.getGameData(gameName);
    const controlledNationFilenames = playerGameData.getNationFilenamesControlledByPlayer();
    const payload = new MessagePayload(messageString);

    await commandContext.respondToCommand(new MessagePayload(`The turnfile will be sent to you by DM shortly.`));

    const promises = controlledNationFilenames.map(async (nationFilename) =>
    {
        const turnFileBuffer = await gameObject.emitPromiseWithGameDataToServer("GET_TURN_FILE", { nationFilename }, 130000);
        await payload.setAttachment(`${nationFilename}_turn_${status.getTurnNumber()}.trn`, turnFileBuffer);
    });

    await Promise.allSettled(promises);
    await commandContext.respondToSender(payload);
}