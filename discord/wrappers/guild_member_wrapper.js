
const assert = require("../../asserter.js");

module.exports = GuildMemberWrapper;

function GuildMemberWrapper(discordJsGuildMemberObject, guildWrapper)
{
    const _discordJsGuildMemberObject = discordJsGuildMemberObject;
    const _guildWrapper = guildWrapper;

    assert.isObjectOrThrow(discordJsGuildMemberObject);
    assert.isObjectOrThrow(guildWrapper);

    this.getGuildWrapper = () => _guildWrapper;
  
    this.getId = () => _discordJsGuildMemberObject.id;
    this.getUsername = () => (_discordJsGuildMemberObject.user != null) ? _discordJsGuildMemberObject.user.username : null;
    this.getNickname = () => _discordJsGuildMemberObject.nickname;
    this.getNameInGuild = () => this.getNickname() ?? this.getUsername() ?? "User Left Guild";
    this.getGuildId = () => _guildWrapper.getId();

    this.hasRole = (discordRoleId) => _discordJsGuildMemberObject.roles.cache.get(discordRoleId) != null;
    this.addRole = (discordRoleObject) => _discordJsGuildMemberObject.roles.add(discordRoleObject);
    this.removeRole = (discordRoleObject) => _discordJsGuildMemberObject.roles.remove(discordRoleObject);
    this.fetchRole = (discordRoleId) => _discordJsGuildMemberObject.roles.fetch(discordRoleId, { cache: true });
    this.getHighestDiscordRolePosition = () => _discordJsGuildMemberObject.roles.highest.position;
    this.sendMessage = (payload) => payload.send(_discordJsGuildMemberObject);
}
