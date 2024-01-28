
const log = require("../../logger.js");
const assert = require("../../asserter.js");
const MenuScreen = require("./menu_screen.js");
const config = require("../../config/config.json");
const MenuStructure = require("./menu_structure.js");
const MessagePayload = require("../../discord/prototypes/message_payload.js");

const INTRO_MESSAGE = `Choose a number from the menu below to change a setting, or type \`${config.commandPrefix}finish\` to finish changing settings.:\n\n`;

module.exports = ChangeSettingsMenu;

function ChangeSettingsMenu(gameObject, memberWrapper)
{
    const _menuStructure = new MenuStructure(memberWrapper);
    const _screens = _createMenuScreens(_menuStructure, gameObject);

    _menuStructure.addIntroductionMessage(INTRO_MESSAGE);
    _menuStructure.addScreens(..._screens);

    return _menuStructure;
}


function _createMenuScreens(menuStructure, gameObject)
{
    const menuScreens = [];
    const settingsObject = gameObject.getSettingsObject();
    const mainScreen = _createMainScreen(menuStructure, settingsObject);

    menuScreens.push(mainScreen);

    settingsObject.forEachChangeableSetting((setting) =>
    {
        const display = setting.getPrompt();
        menuScreens.push(new MenuScreen(display, _inputHandler));

        async function _inputHandler(input)
        {
            try
            {
                await menuStructure.sendMessage(new MessagePayload(`Changing setting; this may take a while...`));
                await setting.setValue(input);
                
                // Delete ftherlnd so that some settings that get
                // encoded in it (like maps) are cleared properly
                // Kill/launch is also needed so the dom instance
                // doesn't retain the previous setting in memory
                await gameObject.overwriteSettings();
                await gameObject.kill();
                await gameObject.launch();
    
                _updateMainScreenDisplay(mainScreen, settingsObject);
                
                await menuStructure.sendMessage(new MessagePayload(`Setting **${setting.getName()}** was changed to **${setting.getReadableValue()}**\n\n${INTRO_MESSAGE}`));
                menuStructure.goBackToPreviousScreen();
            }

            catch(err)
            {
                log.error(log.getLeanLevel(), `ERROR when changing setting ${setting.getName()} with input ${input}`, err);
                return Promise.reject(new Error(`Error occurred changing setting: ${err.message}`));
            }
        }
    });

    return menuScreens;
}

function _createMainScreen(menuStructure, settingsObject)
{
    const mainScreen = new MenuScreen("", (input) =>
    {
        const errStr = "You must type the index number of the setting you wish to change.";

        if (assert.isInteger(+input) === false)
            return errStr;

        try
        {
            menuStructure.goToScreenAtIndex(+input);
        }

        catch(err)
        {
            return errStr;
        }
    });

    _updateMainScreenDisplay(mainScreen, settingsObject);
    return mainScreen;
}

function _updateMainScreenDisplay(mainScreenObject, settingsObject)
{
    var i = 1;
    var mainScreenDisplay = "";

    settingsObject.forEachChangeableSetting((setting, key) => 
    {
        const currentValue = setting.getReadableValue();
        mainScreenDisplay += `${i}. `.width(4) + `${setting.getName()} `.width(24) + `${currentValue}\n`;
        i++;
    });

    mainScreenObject.setDisplayText(mainScreenDisplay.toBox());
}