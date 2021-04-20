
const log = require("../../logger.js");
const MenuScreen = require("./menu_screen.js");
const config = require("../../config/config.json");
const MenuStructure = require("./menu_structure.js");
const activeMenuStore = require("../active_menu_store.js");
const gamesStore = require("../../games/ongoing_games_store.js");

module.exports = HostMenu;

function HostMenu(gameObject, useDefaults = false)
{
    const _screens = _loadSettingsScreensInOrder(gameObject, useDefaults);
    const _guildMemberWrapper = gameObject.getOrganizerMemberWrapper();

    const _menuStructure = new MenuStructure(_guildMemberWrapper);

    var reservedName;

    _menuStructure.addIntroductionMessage(`Welcome to the Assisted Hosting System! I will be asking you for a number of settings to host your game. You can also use the website interface instead of this menu by accessing the following link: ${config.fullSecureUrl}`);
    _menuStructure.addScreens(..._screens);
    _menuStructure.addBehaviourOnInputValidated((currentScreenIndex) => _menuStructure.goToNextScreen());
    _menuStructure.addBehaviourOnFinishedMenu(() => 
    {
        activeMenuStore.removeActiveInstance(_guildMemberWrapper.getId());
        return Promise.resolve(gamesStore.addOngoingGame(gameObject))
        .then(() => gameObject.createNewChannel())
        .then(() => gameObject.createNewRole())
        .then(() => gameObject.pinSettingsToChannel())
        .then(() => gameObject.save())
        .then(() => log.general(log.getNormalLevel(), `Game ${gameObject.getName()} was created successfully.`))
        .then(() => gameObject.sendMessageToOrganizer(`Game ${gameObject.getName()} was created successfully. You can connect to it at IP **${gameObject.getIp()}** and Port **${gameObject.getPort()}**. You will find its channel in the open games category, with a pinned post detailing the chosen settings.`))
        .catch((err) =>
        {
            log.error(log.getLeanLevel(), `ERROR when creating ${gameObject.getName()} through hosting menu. Cleaning it up`, err);
            if (gameObject == null)
                return Promise.reject(err);
    
            return gameObject.deleteGame()
            .then(() => gameObject.deleteRole())
            .then(() => gameObject.deleteChannel())
            .then(() => Promise.reject(err));
        });
    });

    _menuStructure.hasGameNameReserved = (name) => reservedName === name;
    _menuStructure.reserveGameName = (name) => reservedName = name;

    //TODO: must be able to catch when a menu finishes too early, to clean up the game instances

    return _menuStructure;
}

function _loadSettingsScreensInOrder(gameObject, useDefaults = false)
{
    var menuScreens = [];
    var settingsObject = gameObject.getSettingsObject();

    settingsObject.forEachSetting((setting) => 
    {
        var display = setting.getPrompt();
        var behaviour = setting.setValue;

        if (useDefaults === true)
        {
            log.general(log.getVerboseLevel(), (`Loading host menu setting screen ${setting.getName()} using default values '${setting.getDefault()}'`));
            menuScreens.push(new MenuScreen(display, () => setting.setValue(setting.getDefault())));
        }

        else menuScreens.push(new MenuScreen(display, behaviour));
    });

    return menuScreens;
}