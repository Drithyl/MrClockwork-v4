
const assert = require("../../asserter.js");

module.exports = GuildMemberWrapper;

function GuildMemberWrapper(discordJsGuildMemberObject, guildWrapper)
{
    const _discordJsGuildMemberObject = discordJsGuildMemberObject;
    const _guildWrapper = guildWrapper;

    assert.isObjectOrThrow(discordJsGuildMemberObject);
    assert.isObjectOrThrow(guildWrapper);

    this.getGuildWrapper = () => _guildWrapper;
  
    this.getId = () => discordJsGuildMemberObject.id;
    this.getUsername = () => discordJsGuildMemberObject.user.username;
    this.getNickname = () => discordJsGuildMemberObject.nickname;
    this.getNameInGuild = () => (this.getNickname() != null) ? this.getNickname() : this.getUsername();
    this.getGuildId = () => _guildWrapper.getGuildId();

    this.hasRole = (discordRoleId) => _discordJsGuildMemberObject.roles.cache.get(discordRoleId) != null;
    this.addRole = (discordRoleObject) => _discordJsGuildMemberObject.roles.add(discordRoleObject);
    this.removeRole = (discordRoleObject) => _discordJsGuildMemberObject.roles.remove(discordRoleObject);
    this.fetchRole = (discordRoleId) => _discordJsGuildMemberObject.roles.fetch(discordRoleId);
    this.getHighestDiscordRolePosition = () => discordJsGuildMemberObject.roles.highest.position;
    this.sendMessage = (payload) => payload.send(_discordJsGuildMemberObject);
}
