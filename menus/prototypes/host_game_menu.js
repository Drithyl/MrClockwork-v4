
const MenuScreen = require("./menu_screen.js");
const MenuStructure = require("./menu_structure.js");
const activeMenuStore = require("../active_menu_store.js");

module.exports = HostMenu;

function HostMenu(gameObject, useDefaults = false)
{
  const _screens = _loadSettingsScreensInOrder(gameObject, useDefaults);
  const _guildMemberWrapper = gameObject.getOrganizerMemberWrapper();
  const _guildMemberId = _guildMemberWrapper.getId();

  const _menuStructure = new MenuStructure(_guildMemberWrapper);

  var reservedName;

  _menuStructure.addIntroductionMessage(`Welcome to the Assisted Hosting System! I will be asking you for a number of settings to host your game. You can also use the website interface instead of this menu by accessing the following link: localhost:3000/host_game/${_guildMemberId}/${_sessionUuid}`);
  _menuStructure.addScreens(..._screens);
  _menuStructure.addBehaviourOnInputValidated((currentScreenIndex) => _menuStructure.goToNextScreen());
  _menuStructure.addBehaviourOnFinishedMenu(() => 
  {
    activeMenuStore.removeActiveInstance(_guildMemberWrapper.getId());
    return gameObject.createNewChannel()
    .then(() => gameObject.createNewRole())
    .then(() => gameObject.pinSettingsToChannel());
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

  settingsObject.forEachSettingObject((setting) => 
  {
    var display = setting.getPrompt();
    var behaviour = setting.setValue;

    if (useDefaults === true)
    {
      console.log(`Using default value '${setting.getDefault()}'`);
      menuScreens.push(new MenuScreen(display, () => setting.setValue(setting.getDefault())));
    }

    else menuScreens.push(new MenuScreen(display, behaviour));
  });

  return menuScreens;
}