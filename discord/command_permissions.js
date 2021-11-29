
const { SemanticError, PermissionsError } = require("../errors/custom_errors.js");


exports.assertCommandIsUsedInGameChannel = (...args) => _assertCommandIsUsedInGameChannel(...args);
exports.assertServerIsOnline = (...args) => _assertServerIsOnline(...args);
exports.assertGameIsOnline = (...args) => _assertGameIsOnline(...args);
exports.assertGameIsOffline = (...args) => _assertGameIsOffline(...args);
exports.assertGameHasStarted = (...args) => _assertGameHasStarted(...args);
exports.assertGameHasNotStarted = (...args) => _assertGameHasNotStarted(...args);
exports.assertGameIsBlitz = (...args) => _assertGameIsBlitz(...args);
exports.assertGameIsNotBlitz = (...args) => _assertGameIsNotBlitz(...args);
exports.assertMemberIsTrusted = (...args) => _assertMemberIsTrusted(...args);
exports.assertMemberIsGameMaster = (...args) => _assertMemberIsGameMaster(...args);
exports.assertMemberIsGuildOwner = (...args) => _assertMemberIsGuildOwner(...args);
exports.assertMemberIsOrganizer = (...args) => _assertMemberIsOrganizer(...args);
exports.assertMemberIsPlayer = (...args) => _assertMemberIsPlayer(...args);
exports.assertMemberIsDev = (...args) => _assertMemberIsDev(...args);
exports.assertBotHasPermissionToManageRoles = (...args) => _assertBotHasPermissionToManageRoles(...args);
exports.assertBotHasPermissionToManageChannels = (...args) => _assertBotHasPermissionToManageChannels(...args);

//TODO: revise all functions, many were written with an older version of the commandContext
function _assertCommandIsUsedInGameChannel(commandContext)
{
    if (commandContext.isGameCommand() === false)
        throw new SemanticError(`This command must be used in the channel of an ongoing game.`);
}

//TODO: Specify type of Error thrown
function _assertServerIsOnline(commandContext)
{
    const game = commandContext.getGameTargetedByCommand();

    if (game.isServerOnline() === false)
        throw new Error(`The server on which this game is hosted is offline.`);
}

//TODO: Specify type of Error thrown
function _assertGameIsOnline(commandContext)
{
    const game = commandContext.getGameTargetedByCommand();

    return game.isOnlineCheck()
    .then((isOnline) =>
    {
        if (isOnline === true)
            return Promise.resolve();
        
        else return Promise.reject(new Error(`This game's instance is offline.`));
    })
    .catch((err) => Promise.reject(err));
}

//TODO: Specify type of Error thrown
function _assertGameIsOffline(commandContext)
{
    const game = commandContext.getGameTargetedByCommand();

    return game.isOnlineCheck()
    .then((isOnline) =>
    {
        if (isOnline === false)
            return Promise.resolve();
        
        else return Promise.reject(new Error(`This game's instance is already online.`));
    })
    .catch((err) => Promise.reject(err));
}

function _assertGameHasStarted(commandContext)
{
    const game = commandContext.getGameTargetedByCommand();

    return game.checkIfGameStarted()
    .then((hasGameStarted) =>
    {
        if (hasGameStarted === false)
            return Promise.reject(new SemanticError(`This game has not started yet.`));

        else return Promise.resolve();
    });
}

function _assertGameHasNotStarted(commandContext)
{
    const game = commandContext.getGameTargetedByCommand();

    return game.checkIfGameStarted()
    .then((hasGameStarted) =>
    {
        if (hasGameStarted === true)
            return Promise.reject(new SemanticError(`This game has already started.`));

        else return Promise.resolve();
    });
}

function _assertGameIsBlitz(commandContext)
{
    const game = commandContext.getGameTargetedByCommand();

    if (game.assertGameIsBlitz() === false)
        throw new SemanticError(`This command can only be used in a blitz game.`);
}

function _assertGameIsNotBlitz(commandContext)
{
    const game = commandContext.getGameTargetedByCommand();

    if (game.assertGameIsBlitz() === true)
        throw new SemanticError(`This command cannot be used in a blitz game.`);
}

function _assertMemberIsTrusted(commandContext)
{
    if (commandContext.isSenderDev() === true)
        return Promise.resolve();

    return commandContext.checkSenderIsTrusted()
    .then((isTrusted) =>
    {
        if (isTrusted === true)
            return Promise.resolve();

        else return Promise.reject(new SemanticError(`You must be a trusted member before you can use this command.`));
    });
}

function _assertMemberIsGameMaster(commandContext)
{
    if (commandContext.isSenderDev() === true)
        return Promise.resolve();

    return commandContext.checkSenderIsGameMasterOrHigher()
    .then((isGmOrHigher) =>
    {
        if (isGmOrHigher === true)
            return Promise.resolve();

        else return Promise.reject(new SemanticError(`You must be a Game Master or higher to use this command.`));
    });
}

function _assertMemberIsGuildOwner(commandContext)
{
    if (commandContext.isSenderGuildOwner() === false)
        throw new PermissionsError(`Only the owner of this guild can use this command.`);
}

function _assertMemberIsOrganizer(commandContext)
{
    if (commandContext.isSenderGameOrganizer() === true)
        return Promise.resolve();

    return commandContext.checkSenderIsGameMasterOrHigher()
    .then((isGmOrHigher) =>
    {
        if (isGmOrHigher === true)
            return Promise.resolve();

        else return Promise.reject(new SemanticError(`You must be the organizer of this game.`));
    });
}

function _assertMemberIsPlayer(commandContext)
{
    if (commandContext.isSenderGamePlayer() === false)
        throw new PermissionsError(`Only players registered in this game can use this command.`);
}

function _assertMemberIsDev(commandContext)
{
    if (commandContext.isSenderDev() === false)
        throw new PermissionsError(`This command can only be used by the bot devs.`);
}

function _assertBotHasPermissionToManageRoles(commandContext)
{
    const guildWrapper = getGuildWrapper(commandContext);
    return guildWrapper.doesBotHavePermission("MANAGE_ROLES");
}

function _assertBotHasPermissionToManageChannels(commandContext)
{
    const guildWrapper = getGuildWrapper(commandContext);
    return guildWrapper.doesBotHavePermission("MANAGE_CHANNELS");
}

function getGuildWrapper(commandContext)
{
    if (commandContext.wasSentByDm() === true)
        throw new SemanticError(`This command must be used inside a guild channel.`);

    return commandContext.getGuildWrapper();
}