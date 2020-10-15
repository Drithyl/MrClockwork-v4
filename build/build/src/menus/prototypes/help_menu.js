"use strict";
var MenuStructure = require("./menu_structure.js");
var commandStore = require("../../discord/command_store.js");
exports.startHelpMenu = function (guildMemberWrapper) {
    var _menuStructure = new MenuStructure(guildMemberWrapper);
    _createHelpScreen(_menuStructure);
    return _menuStructure;
};
function _createHelpScreen(menuStructureObject) {
    var id = "HELP_SCREEN";
    var display = _createMainScreenDisplay();
    menuStructureObject.addFirstScreen(id, display, _mainScreenBehaviour);
}
function _createHelpScreenDisplay() {
    var displayText = "Below is the numbered list of all the commands available. Type a command's index to see more details:\n\n";
    commandStore.forEachCommand(function (command, index) {
        displayText += index + ". " + command.getShortHelpText() + "\n";
    });
    return displayText;
}
function _mainScreenBehaviour(userSelectedCommandIndex) {
    var selectedCommand = commandStore.getCommandByIndex(userSelectedCommandIndex);
    return selectedCommand.getHelpText();
}
//# sourceMappingURL=help_menu.js.map