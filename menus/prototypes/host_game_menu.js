
const log = require("../../logger.js");
const MenuScreen = require("./menu_screen.js");
const config = require("../../config/config.json");
const MenuStructure = require("./menu_structure.js");
const activeMenuStore = require("../active_menu_store.js");
const gamesStore = require("../../games/ongoing_games_store.js");
const MessagePayload = require("../../discord/prototypes/message_payload.js");

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
        return gameObject.createNewChannel()
        .then(() => gameObject.createNewRole())
        .then(() => gamesStore.addOngoingGame(gameObject))
        .then(() => gameObject.pinSettingsToChannel())
        .then(() => gameObject.save())
        .then(() => gameObject.launch())
        .then(() => log.general(log.getNormalLevel(), `Game ${gameObject.getName()} was created successfully.`))
        .then(() => gameObject.sendMessageToOrganizer(`Game ${gameObject.getName()} was created successfully. You can connect to it at IP **${gameObject.getIp()}** and Port **${gameObject.getPort()}**. You will find its channel in the open games category, with a pinned post detailing the chosen settings.`))
        .catch((err) =>
        {
            if (gameObject == null)
            {
                log.error(log.getLeanLevel(), `ERROR when creating game through hosting menu; no game instance to clean up`, err);
                return _menuStructure.sendMessage(new MessagePayload(`Error occurred when creating the game: ${err.message}`));
            }
    
            log.error(log.getLeanLevel(), `ERROR when creating ${gameObject.getName()} through hosting menu. Cleaning it up`, err);
            _menuStructure.sendMessage(new MessagePayload(`Error occurred when creating the game: ${err.message}`));

            return gameObject.deleteGame()
            .then(() => gameObject.deleteRole())
            .then(() => gameObject.deleteChannel())
            .catch((err) =>
            {
                log.error(log.getLeanLevel(), `ERROR when cleaning game`, err);
                _menuStructure.sendMessage(new MessagePayload(`Couldn't clean game properly; a channel or role may remain that will need to be deleted manually: ${err.message}`));
            });
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