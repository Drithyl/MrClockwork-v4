
const UserWrapper = require("./user_wrapper");
const guildStore = require("../guild_store.js");
const GuildMemberWrapper = require("./guild_member_wrapper.js");

const { commandPrefix } = require("../../config/config.json");
const messenger = require("../messenger.js");

module.exports = MessageWrapper;

function MessageWrapper(discordJsMessageObject)
{
  const _discordJsMessageObject = discordJsMessageObject;
  
  const _userWrapper = new UserWrapper(_discordJsMessageObject.author);
  var _guildWrapper;
  var _guildMemberWrapper;
  
  this.getSenderUserWrapper = () => _userWrapper;
  this.getSenderId = () => _userWrapper.getId();
  this.getSenderUsername = () => _userWrapper.getUsername();
  this.getDestinationChannel = () => _discordJsMessageObject.channel;
  this.getDestinationChannelType = () => _discordJsMessageObject.channel.type;
  this.getMessageContent = () => _discordJsMessageObject.content;
  
  /* only messages sent in guilds (non-dms) will have these properties defined */
  if (_discordJsMessageObject.guild != null)
    _guildWrapper = guildStore.getGuildWrapperById(_discordJsMessageObject.guild.id);

  if (_guildWrapper != null)
    _guildMemberWrapper = new GuildMemberWrapper(_discordJsMessageObject.member, _guildWrapper);

  this.getGuildWrapper = () => _guildWrapper;
  this.getDestinationGuildWrapper = () => _guildWrapper;
  this.getDestinationGuildId = () => _guildWrapper.getId();
  this.getSenderGuildMemberWrapper = () => _guildMemberWrapper;
  /*****************************************************************************/

  this.wasSentByBot = () => _discordJsMessageObject.content.bot;
  this.editMessageContent = (newContent) => _discordJsMessageObject.edit(newContent);
  this.isDirectMessage = () => this.getDestinationChannelType() === "dm";
  this.startsWithCommandPrefix = () => _startsWithCommandPrefix(this.getMessageContent());

  this.respond = (response, ...args) => messenger.send(this.getDestinationChannel(), response, ...args);
  this.pin = () => 
  {
    return _discordJsMessageObject.pin();
  };
}

function _startsWithCommandPrefix(messageContent)
{
  return messageContent[0] === commandPrefix;
}