"use strict";
var config = require("../config/config.json");
var messenger = require("../discord/messenger.js");
var backRegexp = new RegExp("^" + config.prefix + "BACK", "i");
var endRegexp = new RegExp("^" + config.prefix + "FINISH", "i");
var HelpMenu = require("./prototypes/help_menu.js");
var HostGameMenu = require("./prototypes/host_game_menu.js");
var ChangeSettingsMenu = require("./prototypes/change_settings_menu.js");
var ChangePlayerPreferencesMenu = require("./prototypes/change_player_preferences_menu.js");
var activeMenus = {};
module.exports.startHelpMenu = function (commandContext) {
    var memberId = commandContext.getCommandSenderId();
    var helpMenuInstance = new HelpMenu(commandContext);
    //finish any previous instances of a menu
    deleteInstance(memberId);
    addInstance(helpMenuInstance, memberId, "HELP");
    return helpMenuInstance.startMenu();
};
module.exports.startHostGameMenu = function (newGameObject, useDefaults) {
    var memberId = newGameObject.getOrganizerId();
    var hostMenuInstance = new HostGameMenu(newGameObject, useDefaults);
    //finish any previous instances of a menu
    deleteInstance(memberId);
    addInstance(hostMenuInstance, memberId, "HOST");
    return hostMenuInstance.startMenu();
};
module.exports.startChangeSettingsMenu = function (commandContext) {
    var memberId = commandContext.getCommandSenderId();
    var changeSettingsMenuInstance = new ChangeSettingsMenu(commandContext);
    //finish any previous instances of a menu
    deleteInstance(memberId);
    addInstance(changeSettingsMenuInstance, memberId, "CHANGE_SETTINGS");
    return changeSettingsMenuInstance.startMenu();
};
module.exports.startChangePlayerPreferencesMenu = function (commandContext) {
    var memberId = commandContext.getCommandSenderId();
    var changePlayerPreferencesMenuInstance = new ChangePlayerPreferencesMenu(commandContext);
    //finish any previous instances of a menu
    deleteInstance(memberId);
    addInstance(changePlayerPreferencesMenuInstance, memberId, "CHANGE_PLAYER_PREFERENCES");
    return changePlayerPreferencesMenuInstance.startMenu();
};
module.exports.removeActiveInstance = function (memberId) {
    deleteInstance(memberId);
};
module.exports.finish = function (userId) {
    console.log("Finishing menu...");
    return activeMenus[userId].instance.sendMessage("You have closed this instance.")
        .then(function () { return Promise.resolve(deleteInstance(userId)); });
};
module.exports.isReservedCommand = function (command) {
    return backRegexp.test(command) === true || endRegexp.test(command) === true;
};
module.exports.handleInput = function (userId, messageWrapper) {
    var activeMenuInstance = activeMenus[userId].instance;
    var input = messageWrapper.getMessageContent();
    activeMenuInstance.handleInput(input);
};
module.exports.isUserInMenu = function (userId) {
    return activeMenus[userId] != null;
};
module.exports.getUsersMenuType = function (userId) {
    if (activeMenus[userId] != null) {
        return activeMenus[userId].type;
    }
    else
        return null;
};
module.exports.hasHostingInstanceWithGameNameReserved = function (name) {
    for (var id in activeMenus) {
        var instance = activeMenus[id];
        if (typeof instance.hasGameNameReserved === "function" && instance.hasGameNameReserved(name) === true)
            return true;
    }
    return false;
};
function addInstance(instance, userId, type) {
    console.log("Adding instance to list.");
    activeMenus[userId] = { instance: instance, type: type };
}
function deleteInstance(userId) {
    if (activeMenus[userId] != null && typeof activeMenus[userId].kill === "string") {
        activeMenus[userId].instance.kill();
    }
    delete activeMenus[userId];
}
//# sourceMappingURL=active_menu_store.js.map