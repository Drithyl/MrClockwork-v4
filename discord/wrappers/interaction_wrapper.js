
const UserWrapper = require("./user_wrapper");
const guildStore = require("../guild_store.js");
const GuildMemberWrapper = require("./guild_member_wrapper.js");

module.exports = InteractionWrapper;

function InteractionWrapper(discordJsInteractionObject)
{
    const _discordJsInteractionObject = discordJsInteractionObject;

    const _userWrapper = new UserWrapper(_discordJsInteractionObject.user);
    let _guildWrapper;
    let _guildMemberWrapper;

    this.getId = () => _discordJsInteractionObject.id;
    this.getToken = () => _discordJsInteractionObject.token;
    this.getSenderUserWrapper = () => _userWrapper;
    this.getSenderId = () => _userWrapper.getId();
    this.getSenderUsername = () => _userWrapper.getUsername();
    this.getDestinationChannel = () => _discordJsInteractionObject.channel;
    this.getDestinationChannelType = () => _discordJsInteractionObject.channel.type;
    this.getInteractionType = () => _discordJsInteractionObject.type;

    this.isCommand = () => _discordJsInteractionObject.isCommand();
    this.isButton = () => _discordJsInteractionObject.isButton();
    this.isMessageComponent = () => _discordJsInteractionObject.isMessageComponent();
    this.isSelectMenu = () => _discordJsInteractionObject.isSelectMenu();
    this.isDirectMessage = () => _discordJsInteractionObject.inGuild() === false;
    this.wasSentByDm = () => _discordJsInteractionObject.inGuild() === false;


    /*****************************************************************************/
    /* only messages sent in guilds (non-dms) will have these properties defined */
    if (this.isDirectMessage() === false)
        _guildWrapper = guildStore.getGuildWrapperById(_discordJsInteractionObject.guildId);

    if (_guildWrapper != null)
        _guildMemberWrapper = new GuildMemberWrapper(_discordJsInteractionObject.member, _guildWrapper);

    this.getGuildWrapper = () => _guildWrapper;
    this.getDestinationGuildWrapper = () => _guildWrapper;
    this.getDestinationGuildId = () => _discordJsInteractionObject.guildID;
    this.getSenderGuildMemberWrapper = () => _guildMemberWrapper;
    /*****************************************************************************/

}