
const log = require("../logger.js");
const config = require("../config/config.json");
const HelpMenu = require("./prototypes/help_menu.js");
const HostGameMenu = require("./prototypes/host_game_menu.js");
const ChangeSettingsMenu = require("./prototypes/change_settings_menu.js");
const ChangePlayerPreferencesMenu = require("./prototypes/change_player_preferences_menu.js");
const MessagePayload = require("../discord/prototypes/message_payload.js");


const backRegexp = new RegExp(`^${config.commandPrefix}BACK`, "i");
const endRegexp = new RegExp(`^${config.commandPrefix}FINISH`, "i");

var activeMenus = {};

module.exports.startHelpMenu = function(commandContext)
{
    const memberId = commandContext.getCommandSenderId();
    const userWrapper = commandContext.getSenderUserWrapper();
    const helpMenuInstance = new HelpMenu(userWrapper);

    //finish any previous instances of a menu
    _deleteInstance(memberId);
    _addInstance(helpMenuInstance, memberId, "HELP");

    return helpMenuInstance.startMenu();
};

module.exports.startHostGameMenu = function(newGameObject, useDefaults)
{
    const memberId = newGameObject.getOrganizerId();
    const hostMenuInstance = new HostGameMenu(newGameObject, useDefaults);

    //finish any previous instances of a menu
    _deleteInstance(memberId);
    _addInstance(hostMenuInstance, memberId, "HOST");

    return hostMenuInstance.startMenu();
};

module.exports.startChangeSettingsMenu = function(commandContext)
{
    const memberWrapper = commandContext.getSenderGuildMemberWrapper();
    const memberId = memberWrapper.getId();
    const gameObject = commandContext.getGameTargetedByCommand();
    const changeSettingsMenuInstance = new ChangeSettingsMenu(gameObject, memberWrapper);

    //finish any previous instances of a menu
    _deleteInstance(memberId);
    _addInstance(changeSettingsMenuInstance, memberId, "CHANGE_SETTINGS");

    return changeSettingsMenuInstance.startMenu();
};

module.exports.startChangePlayerPreferencesMenu = function(commandContext)
{
    const memberId = commandContext.getCommandSenderId();
    const changePlayerPreferencesMenuInstance = new ChangePlayerPreferencesMenu(commandContext);

    //finish any previous instances of a menu
    _deleteInstance(memberId);
    _addInstance(changePlayerPreferencesMenuInstance, memberId, "CHANGE_PLAYER_PREFERENCES");

    return changePlayerPreferencesMenuInstance.startMenu();
};

module.exports.removeActiveInstance = function(memberId)
{
    _deleteInstance(memberId);
};

module.exports.finish = function(userId)
{
    log.general(log.getVerboseLevel(), `Finishing menu for user ${userId}...`);
    return activeMenus[userId].instance.sendMessage(new MessagePayload(`You have closed this instance.`))
    .then(() => Promise.resolve(deleteInstance(userId)));
};

module.exports.isReservedCommand = function(command)
{
    return backRegexp.test(command) === true || endRegexp.test(command) === true;
};

module.exports.handleInput = function(userId, messageWrapper)
{
    const activeMenuInstance = activeMenus[userId].instance;
    const input = messageWrapper.getMessageContent();

    activeMenuInstance.handleInput(input);
};

module.exports.handleReaction = function(userId, emoji, reactedMessageWrapper)
{
    if (activeMenus[userId] == null)
        return;
        
    const activeMenuInstance = activeMenus[userId].instance;
    activeMenuInstance.handleReaction(emoji, reactedMessageWrapper);
};

module.exports.isUserInMenu = function(userId)
{
    return activeMenus[userId] != null;
};

module.exports.getUsersMenuType = function(userId)
{
    if (activeMenus[userId] != null)
    {
        return activeMenus[userId].type;
    }

    else return null;
};

module.exports.hasHostingInstanceWithGameNameReserved = (name) =>
{
    for (var id in activeMenus)
    {
        var instance = activeMenus[id];

        if (typeof instance.hasGameNameReserved === "function" && instance.hasGameNameReserved(name) === true)
        return true;
    }

    return false;
};

function _addInstance(instance, userId, type)
{
    log.general(log.getVerboseLevel(), `Adding ${type} menu instance to list.`);
    activeMenus[userId] = {instance, type};
}

function _deleteInstance(userId)
{
    if (activeMenus[userId] != null && typeof activeMenus[userId].kill === "string")
    {
        activeMenus[userId].instance.kill();
    }

    delete activeMenus[userId];
    log.general(log.getVerboseLevel(), `Deleted menu instance of ${userId}.`);
}
