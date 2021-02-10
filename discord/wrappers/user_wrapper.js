
const messenger = require("../messenger.js");

module.exports = UserWrapper;

function UserWrapper(discordJsUserObject)
{
  const _discordJsUserObject = discordJsUserObject;

  this.getId = () => _discordJsUserObject.id;
  this.getUsername = () => _discordJsUserObject.username;
  this.sendMessage = (...args) => messenger.send(_discordJsUserObject, ...args);
}
