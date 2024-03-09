const guildStore = require("../guild_store.js");
const UserWrapper = require("./user_wrapper.js");
const config = require("../../config/config.json");
const ongoingGamesStore = require("../../games/ongoing_games_store.js");

class InteractionContext
{
    constructor(interactionBase)
    {
        this.interactionBase = interactionBase;

        this.guild = this.interactionBase.guild;
        this.guildId = this.interactionBase.guildId;
        this.guildWrapper = guildStore.getGuildWrapperById(this.guildId);

        this.channel = this.interactionBase.channel;
        this.channelId = this.interactionBase.channelId;
        this.targetedGame = ongoingGamesStore.getOngoingGameByChannel(this.channelId);

        this.user = this.interactionBase.user;
        this.userId = this.interactionBase.user.id;
        this.userWrapper = new UserWrapper(this.user);
        this.member = this.interactionBase.member;
        this.memberWrapper;

        
        this.isGameInteraction = this.targetedGame != null;
        this.isDm = this.interactionBase.inGuild() === false;
        this.isMemberDev = config.devIds.includes(this.userId);
        this.isMemberGuildOwner;
        this.isMemberTrusted;
        this.isMemberGameMaster;
        this.isMemberOrganizer;
        this.isMemberPlayer;
    }

    async initialize()
    {
        if (this.guildWrapper == null)
            return;

        this.memberWrapper = await this.guildWrapper.fetchGuildMemberWrapperById(this.userId);
        this.isMemberGuildOwner = this.guildWrapper.memberIsOwner(this.userId);
        this.isMemberTrusted = this.guildWrapper.memberHasTrustedRole(this.memberWrapper);
        this.isMemberGameMaster = this.guildWrapper.memberHasGameMasterRole(this.memberWrapper);

        if (this.targetedGame == null)
            return;

        this.isMemberOrganizer = this.userId === this.targetedGame.getOrganizerId();
        this.isMemberPlayer = this.targetedGame.isMemberPlayer(this.userId);
    }
}

module.exports = InteractionContext;
