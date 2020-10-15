














//TODO: finish change settings menu



/*

const rw = require("../../reader_writer.js");
const config = require("../../config/config.json");
const menuNavigator = require("./menu_navigator.js");
const messenger = require("../../discord/messenger.js");
const settingsLoader = require("../../games/settings/loader.js");
const settingsChanger = require("../../games/settings/settings_changer.js");
const MAIN_MENU = "MAIN_MENU";*/

module.exports.start = function(member, game)
{
  console.log(`Starting change settings menu for ${member.user.username} in game ${game.name}.`);
  let instance = createSettingsMenu(member, game);

  return instance.goTo(MAIN_MENU)
  .then(() => Promise.resolve(instance))
  .catch((err) => Promise.reject(new Error(`Could not send ${MAIN_MENU} menu to start the change settings instance:\n\n${err.stack}`)));
};

function createSettingsMenu(member, game)
{
  console.log(`Creating menu...`);
  let data = {game};
  let settings = settingsLoader.getAll(game.gameType);
  let navigator = menuNavigator.create(member, data)
  .addMenu(MAIN_MENU, "", displayMainMenu.bind(null, game.gameType), selectSettingHandler);

  settings.forEach((setting, i) =>
  {
    navigator.addMenu(
    setting.key,
    setting.name,
    displaySelectedSetting.bind(null, setting, game),
    changeSettingHandler
  )});

  console.log("Created.");
  return navigator;
}

function selectSettingHandler(instance, selectedSettingInput)
{
  let game = instance.data.game;
  let selectedSetting = settingsLoader.getByIndex(game.gameType, selectedSettingInput);
  let menu = displaySelectedSetting(selectedSetting, game);

  if (selectedSetting == null)
  {
    console.log(`Selected setting input <${selectedSettingInput}> is invalid.`);
    return instance.member.send(`You must select a number from the list to change the setting. If you're done changing settings, type \`${config.prefix}finish\`.`);
  }

  console.log(`Member selected setting ${selectedSetting.name} to be changed.`);
  instance.data.selectedSetting = selectedSetting;
  instance.goTo(selectedSetting.key)
  .catch((err) => rw.log("error", `Could not send ${selectedSetting.key} menu:\n\n${err.message}`));
}

function changeSettingHandler(instance, newSettingValue)
{
  let changedValue
  let member = instance.member;
  let game = instance.data.game;
  let selectedSetting = instance.data.selectedSetting;

  return settingsChanger.change(game, selectedSetting.key, newSettingValue)
  .then((changedValue) =>
  {
    rw.log("general", `${game.name}'s ${selectedSetting.name} setting was changed to ${changedValue}`);
    return messenger.send(member, `The setting was changed successfully.`)
    .then(() =>
    {
      //send setting change to the game's channel if it's not the master password
      if (selectedSetting.key !== "masterPassword" && game.channel != null)
      {
        return messenger.send(game.channel, `Game setting was changed: ${selectedSetting.toInfo(game.settings[selectedSetting.key], game).toBox()}`);
      }

      return Promise.resolve();
    });
  })
  .then(() => instance.goTo(MAIN_MENU))
  .catch((err) => messenger.sendError(member, `An error occurred while changing the setting:\n\n${err.message}`));
}

function displaySelectedSetting(setting, game)
{
  return `${setting.cue} \n\nCurrent setting is \`${setting.toInfo(game.settings[setting.key], game)}\`.`;
}

function displayMainMenu(gameType)
{
  var str = `Choose a number from the menu below to change a setting, or type \`${config.prefix}finish\` to finish changing settings.:\n\n`;

  settingsLoader.getAll(gameType).forEach(function(mod, index)
  {
    str += `\t${index}. ${mod.name}.\n`;
  });

  return str;
}
