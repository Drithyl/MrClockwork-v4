const MessagePayload = require("../prototypes/message_payload.js");
const InteractionContext = require("./InteractionContext.js");

class CommandContext extends InteractionContext
{
    constructor(interactionBase)
    {
        super(interactionBase);
        this.isCommandInteraction = true;
        this.options = interactionBase.options;
        this.optionsArray = interactionBase.options.data;
        this.name = interactionBase.commandName;
    }

    async initialize()
    {
		await super.initialize();
    }

    static async create(commandInteraction)
    {
        const instance = new CommandContext(commandInteraction);
        await instance.initialize();
        return instance;
    }

    send(...args) {
        return this.channel.send(...args);
    }

    deferReply(isEphemeral = false)  {
        return this.interactionBase.deferReply({ ephemeral: isEphemeral, fetchReply: true });
    }

    followUp(messageString) {
        return this.interactionBase.followUp(Object.assign({content: messageString}, this.options));
    }

    respond(...args) {
        return this.interactionBase.respond(...args);
    }

    respondToCommand(messagePayload){
        return messagePayload.send(this);
    }

    respondWithGameAnnouncement(messagePayload){
        if (this.targetedGame == null) {
            return this.respondToCommand(messagePayload);
        }

        const role = this.targetedGame.getRole();
        return messagePayload.prependToHeader(`${role} `).send(this);
    }

    async respondToSender(messagePayload) {
        await this.respondToCommand(new MessagePayload(`Check your DMs.`));
        return this.userWrapper.sendMessage(messagePayload);
    }

    respondByDm(messagePayload) {
        return this.userWrapper.sendMessage(messagePayload);
    }

    // Core methods to reply to an interaction or send a message to its channel
    reply(...args)
    {
        if (this.interactionBase.replied === true || this.interactionBase.deferred === true)
            return this.interactionBase.followUp(...args);

        else return this.interactionBase.reply(...args);
    }

    fetchMemberWrapperOption(optionName)
    {
        const member = this.options.getMember(optionName);

        if (this.guildWrapper == null)
            return null;

        return this.guildWrapper.fetchGuildMemberWrapperById(member.id);
    }
}

module.exports = CommandContext;
