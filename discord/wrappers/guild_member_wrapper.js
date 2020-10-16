
const messenger = require("../messenger.js");

module.exports = GuildMemberWrapper;

function GuildMemberWrapper(discordJsGuildMemberObject, guildWrapper)
{
  const _discordJsGuildMemberObject = discordJsGuildMemberObject;
  const _guildWrapper = guildWrapper;

  this.getGuildWrapper = () => _guildWrapper;

  this.getId = () => discordJsGuildMemberObject.id;
  this.getUsername = () => discordJsGuildMemberObject.user.username;
  this.getGuildId = () => _guildWrapper.getGuildId();

  this.hasRole = (discordRoleId) => _discordJsGuildMemberObject.roles.cache.get(discordRoleId) != null;
  this.addRole = (discordRoleObject) => _discordJsGuildMemberObject.roles.add(discordRoleObject);
  this.removeRole = (discordRoleObject) => _discordJsGuildMemberObject.roles.remove(discordRoleObject);
  this.getHighestDiscordRolePosition = () => _discordJsGuildMemberObject.highest.position;

  this.getLastMessageInGuild = () => _discordJsGuildMemberObject.lastMessage;

  this.sendMessage = (...args) => messenger.send(_discordJsGuildMemberObject, ...args);
}
