const { SemanticError, PermissionsError } = require("../errors/custom_errors.js");

//TODO: revise all functions, many were written with an older version of the commandContext
exports.assertCommandIsUsedInGameChannel = (commandContext) =>
{
    if (commandContext.isGameInteraction === false)
        throw new SemanticError(`You must use this command inside a game's channel.`);
};

//TODO: Specify type of Error thrown
exports.assertServerIsOnline = (commandContext) =>
{
    const game = commandContext.targetedGame;

    if (game.isServerOnline() === false)
        throw new Error(`Cannot use this command while this game's server is offline. Try again later.`);
};

//TODO: Specify type of Error thrown
exports.assertGameIsOnline = async (commandContext) =>
{
    const game = commandContext.targetedGame;
    const isOnline = await game.isOnlineCheck();

    if (isOnline === false)
        throw new Error(`Cannot use this command while the game is offline. Launch it first.`);
};

//TODO: Specify type of Error thrown
exports.assertGameIsOffline = async (commandContext) =>
{
    const game = commandContext.targetedGame;
    const isOnline = await game.isOnlineCheck();

    if (isOnline === true)
        throw new Error(`Cannot use this command while the game is online.`);
};

exports.assertGameHasStarted = async (commandContext) =>
{
    const game = commandContext.targetedGame;
    const hasStarted = await game.hasGameStarted();

    if (hasStarted === false)
        throw new Error(`Cannot use this command before the game starts.`);
};

exports.assertGameHasNotStarted = async (commandContext) =>
{
    const game = commandContext.targetedGame;
    const hasStarted = await game.hasGameStarted();

    if (hasStarted === true)
        throw new Error(`Cannot use this command after the game has started.`);
};

exports.assertMemberIsTrusted = async (commandContext) =>
{
    if (commandContext.isMemberDev === true)
        return true;

    const isDev = commandContext.isDev;
    const memberWrapper = commandContext.memberWrapper;
    const guild = commandContext.guildWrapper;
    const trustedRole = await guild.fetchTrustedRole();
    const isTrustedOrAbove = await guild.checkMemberHasRoleOrAbove(memberWrapper, trustedRole);

    if (isDev == false && isTrustedOrAbove === false)
        throw new Error(`You must have this community's Trusted role to use this command.`);
};

exports.assertMemberIsGameMaster = async (commandContext) =>
{
    const isDev = commandContext.isDev;
    const memberWrapper = commandContext.memberWrapper;
    const guild = commandContext.guildWrapper;
    const gameMasterRole = await guild.fetchGameMasterRole();
    const isGameMasterOrAbove = await guild.checkMemberHasRoleOrAbove(memberWrapper, gameMasterRole);

    if (isDev === false && isGameMasterOrAbove === false)
        throw new Error(`You must be a Game Master or higher to use this command.`);
};

exports.assertMemberIsGuildOwner = (commandContext) =>
{
    if (commandContext.isMemberGuildOwner === false)
        throw new PermissionsError(`Only the owner of this guild can use this command.`);
};

exports.assertMemberIsOrganizer = async (commandContext) =>
{
    const isDev = commandContext.isDev;
    const isOrganizer = commandContext.isMemberOrganizer;
    const memberWrapper = commandContext.memberWrapper;
    const guild = commandContext.guildWrapper;
    const gameMasterRole = await guild.fetchGameMasterRole();
    const isGameMasterOrAbove = await guild.checkMemberHasRoleOrAbove(memberWrapper, gameMasterRole);

    if (isDev === false && isOrganizer === false && isGameMasterOrAbove === false)
        throw new Error(`You must be the game's organizer or a Game Master to use this command.`);
};

exports.assertMemberIsPlayer = (commandContext) =>
{
    if (commandContext.isMemberPlayer === false)
        throw new PermissionsError(`You must have a pretender claimed in this game to use this command.`);
};

exports.assertMemberIsDev = (commandContext) =>
{
    if (commandContext.isMemberDev === false)
        throw new PermissionsError(`This command can only be used by the bot devs.`);
};

exports.assertBotHasPermissionToManageRoles = (commandContext) =>
{
    const guildWrapper = commandContext.guildWrapper;
    const hasPermissions = guildWrapper.doesBotHavePermission("MANAGE_ROLES");

    if (hasPermissions === false)
        throw new Error(`The Bot must have the Manage Roles permission to do this.`);
};

exports.assertBotHasPermissionToManageChannels = (commandContext) =>
{
    const guildWrapper = commandContext.guildWrapper;
    const hasPermissions = guildWrapper.doesBotHavePermission("MANAGE_CHANNELS");

    if (hasPermissions === false)
        throw new Error(`The Bot must have the Manage Channels permission to do this.`);
};