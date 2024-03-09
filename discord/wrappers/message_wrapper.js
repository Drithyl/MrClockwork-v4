
const assert = require("../../asserter.js");
const guildStore = require("../guild_store.js");
const UserWrapper = require("./user_wrapper.js");
const GuildMemberWrapper = require("./guild_member_wrapper.js");
const MessageEmbedWrapper = require("./message_embed_wrapper.js");

const { commandPrefix } = require("../../config/config.json");
const { ChannelType } = require("discord.js");

module.exports = MessageWrapper;

function MessageWrapper(discordJsMessageObject)
{
    const _discordJsMessageObject = discordJsMessageObject;

    const _userWrapper = new UserWrapper(_discordJsMessageObject.author);
    let _guildWrapper;
    let _guildMemberWrapper;

    this.getId = () => _discordJsMessageObject.id;
    this.getSenderUserWrapper = () => _userWrapper;
    this.getSenderId = () => _userWrapper.getId();
    this.getSenderUsername = () => _userWrapper.getUsername();
    this.getDestinationChannel = () => _discordJsMessageObject.channel;
    this.getDestinationChannelId = () => _discordJsMessageObject.channel.id;
    this.getDestinationChannelType = () => _discordJsMessageObject.channel.type;
    this.getMessageContent = () => _discordJsMessageObject.content;
    this.getMentionedMembers = () => 
    {
        const guildMemberWrappers = [];
        const guild = this.getGuildWrapper();

        _discordJsMessageObject.mentions.members.each((guildMember) =>
        {
            const guildMemberWrapper = new GuildMemberWrapper(guildMember, guild);
            guildMemberWrappers.push(guildMemberWrapper);
        });

        return Promise.resolve(guildMemberWrappers);
    };

    this.getEmbedWrapper = (index = 0) => 
    {
        if (_discordJsMessageObject.embeds.length < index)
            return null;

        return new MessageEmbedWrapper(_discordJsMessageObject.embeds[index], this);
    };

    /* only messages sent in guilds (non-dms) will have these properties defined */
    if (_discordJsMessageObject.guild != null)
        _guildWrapper = guildStore.getGuildWrapperById(_discordJsMessageObject.guild.id);

    if (_guildWrapper != null && _discordJsMessageObject.member != null)
        _guildMemberWrapper = new GuildMemberWrapper(_discordJsMessageObject.member, _guildWrapper);

    this.getGuildWrapper = () => _guildWrapper;
    this.getDestinationGuildWrapper = () => _guildWrapper;
    this.getDestinationGuildId = () => _guildWrapper.getId();
    this.getSenderGuildMemberWrapper = () => _guildMemberWrapper;
    /*****************************************************************************/

    this.wasSentByBot = () => _discordJsMessageObject.author.bot;
    this.editMessageContent = (newContent) => _discordJsMessageObject.edit(newContent);
    this.isDirectMessage = () => this.getDestinationChannelType() === ChannelType.DM;
    this.startsWithCommandPrefix = () => _startsWithCommandPrefix(this.getMessageContent());

    this.respond = (messagePayload) => messagePayload.send(this.getDestinationChannel());
    this.respondToSender = (messagePayload) => messagePayload.send(_discordJsMessageObject.author);
    this.pin = () => _discordJsMessageObject.pin();
    this.unpin = () => _discordJsMessageObject.unpin();

    this.react = (emojiResolvable) => _discordJsMessageObject.react(emojiResolvable);
    this.edit = (newText, editedEmbed) => 
    {
        const options = { embeds: [ editedEmbed ]};

        if (assert.isString(newText) === true)
            options.content = newText;

        return _discordJsMessageObject.edit(options);
    };
}

MessageWrapper.fetchFromChannel = (channel, messageId) =>
{
    return channel.messages.fetch(messageId, { cache: true })
    .then((discordJsMessage) => Promise.resolve(new MessageWrapper(discordJsMessage)))
    .catch((err) => Promise.reject(new Error(`Error fetching message ${messageId} from channel ${channel.name}: ${err.message}`)));
};

function _startsWithCommandPrefix(messageContent)
{
    return messageContent[0] === commandPrefix;
}