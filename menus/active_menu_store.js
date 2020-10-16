
const config = require("../config/config.json");
const messenger = require("../discord/messenger.js");
const backRegexp = new RegExp(`^${config.prefix}BACK`, "i");
const endRegexp = new RegExp(`^${config.prefix}FINISH`, "i");

const HelpMenu = require("./prototypes/help_menu.js");
const HostGameMenu = require("./prototypes/host_game_menu.js");
const ChangeSettingsMenu = require("./prototypes/change_settings_menu.js");
const ChangePlayerPreferencesMenu = require("./prototypes/change_player_preferences_menu.js");

var activeMenus = {};

module.exports.startHelpMenu = function(commandContext)
{
  const memberId = commandContext.getCommandSenderId();
  const helpMenuInstance = new HelpMenu(commandContext);

  //finish any previous instances of a menu
  deleteInstance(memberId);
  addInstance(helpMenuInstance, memberId, "HELP");
  
  return helpMenuInstance.startMenu();
};

module.exports.startHostGameMenu = function(newGameObject, useDefaults)
{
  const memberId = newGameObject.getOrganizerId();
  const hostMenuInstance = new HostGameMenu(newGameObject, useDefaults);

  //finish any previous instances of a menu
  deleteInstance(memberId);
  addInstance(hostMenuInstance, memberId, "HOST");
  
  return hostMenuInstance.startMenu();
};

module.exports.startChangeSettingsMenu = function(commandContext)
{
  const memberId = commandContext.getCommandSenderId();
  const changeSettingsMenuInstance = new ChangeSettingsMenu(commandContext);

  //finish any previous instances of a menu
  deleteInstance(memberId);
  addInstance(changeSettingsMenuInstance, memberId, "CHANGE_SETTINGS");
  
  return changeSettingsMenuInstance.startMenu();
};

module.exports.startChangePlayerPreferencesMenu = function(commandContext)
{
  const memberId = commandContext.getCommandSenderId();
  const changePlayerPreferencesMenuInstance = new ChangePlayerPreferencesMenu(commandContext);

  //finish any previous instances of a menu
  deleteInstance(memberId);
  addInstance(changePlayerPreferencesMenuInstance, memberId, "CHANGE_PLAYER_PREFERENCES");
  
  return changePlayerPreferencesMenuInstance.startMenu();
};

module.exports.removeActiveInstance = function(memberId)
{
  deleteInstance(memberId);
}

module.exports.finish = function(userId)
{
  console.log("Finishing menu...");
  return activeMenus[userId].instance.sendMessage(`You have closed this instance.`)
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
}

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

function addInstance(instance, userId, type)
{
  console.log("Adding instance to list.");
  activeMenus[userId] = {instance, type};
}

function deleteInstance(userId)
{
  if (activeMenus[userId] != null && typeof activeMenus[userId].kill === "string")
  {
    activeMenus[userId].instance.kill();
  }

  delete activeMenus[userId];
}
