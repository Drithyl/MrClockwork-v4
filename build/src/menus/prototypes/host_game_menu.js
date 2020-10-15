"use strict";
var MenuScreen = require("./menu_screen.js");
var MenuStructure = require("./menu_structure.js");
var activeMenuStore = require("../active_menu_store.js");
module.exports = HostMenu;
function HostMenu(gameObject, useDefaults) {
    if (useDefaults === void 0) { useDefaults = false; }
    var _screens = _loadSettingsCreensInOrder(gameObject, useDefaults);
    var _guildMemberWrapper = gameObject.getOrganizerMemberWrapper();
    var _guildMemberId = _guildMemberWrapper.getId();
    var _menuStructure = new MenuStructure(_guildMemberWrapper);
    var reservedName;
    _menuStructure.addIntroductionMessage("Welcome to the Assisted Hosting System! I will be asking you for a number of settings to host your game. You can also use the website interface instead of this menu by accessing the following link: localhost:3000/host_game/" + _guildMemberId + "/" + _sessionUuid);
    _menuStructure.addScreens.apply(_menuStructure, _screens);
    _menuStructure.addBehaviourOnInputValidated(function (currentScreenIndex) { return _menuStructure.goToNextScreen(); });
    _menuStructure.addBehaviourOnFinishedMenu(function () {
        activeMenuStore.removeActiveInstance(_guildMemberWrapper.getId());
        return gameObject.createNewChannel()
            .then(function () { return gameObject.createNewRole(); })
            .then(function () { return gameObject.pinSettingsToChannel(); });
    });
    _menuStructure.hasGameNameReserved = function (name) { return reservedName === name; };
    _menuStructure.reserveGameName = function (name) { return reservedName = name; };
    //TODO: must be able to catch when a menu finishes too early, to clean up the game instances
    return _menuStructure;
}
function _loadSettingsCreensInOrder(gameObject, useDefaults) {
    if (useDefaults === void 0) { useDefaults = false; }
    var menuScreens = [];
    var settingsObject = gameObject.getSettingsObject();
    settingsObject.forEachSettingObject(function (setting) {
        var display = setting.getPrompt();
        var behaviour = setting.setValue;
        if (useDefaults === true) {
            console.log("Using default value '" + setting.getDefault() + "'");
            menuScreens.push(new MenuScreen(display, function () { return setting.setValue(setting.getDefault()); }));
        }
        else
            menuScreens.push(new MenuScreen(display, behaviour));
    });
    return menuScreens;
}
//# sourceMappingURL=host_game_menu.js.map