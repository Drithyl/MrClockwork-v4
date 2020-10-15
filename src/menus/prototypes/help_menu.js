
const MenuStructure = require("./menu_structure.js");
const commandStore = require("../../discord/command_store.js");

exports.startHelpMenu = (guildMemberWrapper) =>
{
    const _menuStructure = new MenuStructure(guildMemberWrapper);
    _createHelpScreen(_menuStructure);
    return _menuStructure;
};

function _createHelpScreen(menuStructureObject)
{
    var id = "HELP_SCREEN";
    var display = _createMainScreenDisplay();

    menuStructureObject.addFirstScreen(id, display, _mainScreenBehaviour);
}

function _createHelpScreenDisplay()
{
    var displayText = "Below is the numbered list of all the commands available. Type a command's index to see more details:\n\n";

    commandStore.forEachCommand((command, index) =>
    {
        displayText += `${index}. ${command.getShortHelpText()}\n`;
    });

    return displayText;
}

function _mainScreenBehaviour(userSelectedCommandIndex)
{
    var selectedCommand = commandStore.getCommandByIndex(userSelectedCommandIndex);
    return selectedCommand.getHelpText();
}