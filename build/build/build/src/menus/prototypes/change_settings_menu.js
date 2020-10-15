"use strict";
//TODO: finish change settings menu
/*

const rw = require("../../reader_writer.js");
const config = require("../../config/config.json");
const menuNavigator = require("./menu_navigator.js");
const messenger = require("../../discord/messenger.js");
const settingsLoader = require("../../games/settings/loader.js");
const settingsChanger = require("../../games/settings/settings_changer.js");
const MAIN_MENU = "MAIN_MENU";*/
module.exports.start = function (member, game) {
    console.log("Starting change settings menu for " + member.user.username + " in game " + game.name + ".");
    var instance = createSettingsMenu(member, game);
    return instance.goTo(MAIN_MENU)
        .then(function () { return Promise.resolve(instance); })
        .catch(function (err) { return Promise.reject(new Error("Could not send " + MAIN_MENU + " menu to start the change settings instance:\n\n" + err.stack)); });
};
function createSettingsMenu(member, game) {
    console.log("Creating menu...");
    var data = { game: game };
    var settings = settingsLoader.getAll(game.gameType);
    var navigator = menuNavigator.create(member, data)
        .addMenu(MAIN_MENU, "", displayMainMenu.bind(null, game.gameType), selectSettingHandler);
    settings.forEach(function (setting, i) {
        navigator.addMenu(setting.key, setting.name, displaySelectedSetting.bind(null, setting, game), changeSettingHandler);
    });
    console.log("Created.");
    return navigator;
}
function selectSettingHandler(instance, selectedSettingInput) {
    var game = instance.data.game;
    var selectedSetting = settingsLoader.getByIndex(game.gameType, selectedSettingInput);
    var menu = displaySelectedSetting(selectedSetting, game);
    if (selectedSetting == null) {
        console.log("Selected setting input <" + selectedSettingInput + "> is invalid.");
        return instance.member.send("You must select a number from the list to change the setting. If you're done changing settings, type `" + config.prefix + "finish`.");
    }
    console.log("Member selected setting " + selectedSetting.name + " to be changed.");
    instance.data.selectedSetting = selectedSetting;
    instance.goTo(selectedSetting.key)
        .catch(function (err) { return rw.log("error", "Could not send " + selectedSetting.key + " menu:\n\n" + err.message); });
}
function changeSettingHandler(instance, newSettingValue) {
    var changedValue;
    var member = instance.member;
    var game = instance.data.game;
    var selectedSetting = instance.data.selectedSetting;
    return settingsChanger.change(game, selectedSetting.key, newSettingValue)
        .then(function (changedValue) {
        rw.log("general", game.name + "'s " + selectedSetting.name + " setting was changed to " + changedValue);
        return messenger.send(member, "The setting was changed successfully.")
            .then(function () {
            //send setting change to the game's channel if it's not the master password
            if (selectedSetting.key !== "masterPassword" && game.channel != null) {
                return messenger.send(game.channel, "Game setting was changed: " + selectedSetting.toInfo(game.settings[selectedSetting.key], game).toBox());
            }
            return Promise.resolve();
        });
    })
        .then(function () { return instance.goTo(MAIN_MENU); })
        .catch(function (err) { return messenger.sendError(member, "An error occurred while changing the setting:\n\n" + err.message); });
}
function displaySelectedSetting(setting, game) {
    return setting.cue + " \n\nCurrent setting is `" + setting.toInfo(game.settings[setting.key], game) + "`.";
}
function displayMainMenu(gameType) {
    var str = "Choose a number from the menu below to change a setting, or type `" + config.prefix + "finish` to finish changing settings.:\n\n";
    settingsLoader.getAll(gameType).forEach(function (mod, index) {
        str += "\t" + index + ". " + mod.name + ".\n";
    });
    return str;
}
//# sourceMappingURL=change_settings_menu.js.map