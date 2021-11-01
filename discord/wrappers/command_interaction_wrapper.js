

const config = require("../../config/config.json");
const InteractionWrapper = require("./interaction_wrapper.js");
const { SemanticError } = require("../../errors/custom_errors");
const ongoingGamesStore = require("../../games/ongoing_games_store.js");


module.exports = CommandInteractionWrapper;

function CommandInteractionWrapper(discordJsInteractionObject)
{
    const _discordJsInteractionObject = discordJsInteractionObject;
    const _interactionWrapper = new InteractionWrapper(_discordJsInteractionObject);
    const _gameTargetedByCommand = ongoingGamesStore.getOngoingGameByChannel(discordJsInteractionObject.channelId);

    _interactionWrapper.getCommand = () => _discordJsInteractionObject.command;
    _interactionWrapper.getCommandId = () => _discordJsInteractionObject.commandId;
    _interactionWrapper.getCommandString = () => _discordJsInteractionObject.commandName;
    _interactionWrapper.getOptions = () => _discordJsInteractionObject.options.data;
    _interactionWrapper.isCommandInteraction = () => true;

    _interactionWrapper.isDeferred = () => _discordJsInteractionObject.deferred;
    _interactionWrapper.isEphemeral = () => _discordJsInteractionObject.ephemeral;
    _interactionWrapper.wasRepliedTo = () => _discordJsInteractionObject.replied;

    _interactionWrapper.defer = (isEphemeral = false) => _discordJsInteractionObject.defer({ ephemeral: isEphemeral });
    _interactionWrapper.deleteReply = () => _discordJsInteractionObject.deleteReply();
    _interactionWrapper.editReply = (newMessageString, options) => _discordJsInteractionObject.editReply(Object.assign({content: newMessageString}, options));
    _interactionWrapper.fetchReply = () => _discordJsInteractionObject.fetchReply();
    _interactionWrapper.followUp = (messageString) => _discordJsInteractionObject.followUp(Object.assign({content: messageString}, options));

    // Core methods to reply to an interaction or send a message to its channel
    _interactionWrapper.reply = (...args) => _discordJsInteractionObject.reply(...args);
    _interactionWrapper.send = (...args) => _interactionWrapper.getDestinationChannel().send(...args);

    // Wrapper methods to reply to an interaction, made to respect the interface created
    // by this wrapper and the CommandContext wrapper, both of which commands and
    // MessagePayload use interchangeably
    _interactionWrapper.respondToCommand = (messagePayload) => messagePayload.send(_interactionWrapper);
    _interactionWrapper.respondToSender = (messagePayload) => messagePayload.send(_interactionWrapper, { ephemeral: true });

    _interactionWrapper.isGameCommand = () => _gameTargetedByCommand != null;
    _interactionWrapper.getGameTargetedByCommand = () => _gameTargetedByCommand;

    _interactionWrapper.isSenderTrusted = () =>
    {
        const guild = _interactionWrapper.getGuildWrapper();
        const member = _interactionWrapper.getSenderGuildMemberWrapper();

        if (guild == null && member == null)
            throw new SemanticError(`This command cannot be used by DM.`);

        return guild.memberHasTrustedRole(member);
    };

    _interactionWrapper.isSenderGameMaster = () =>
    {
        const guild = _interactionWrapper.getGuildWrapper();
        const member = _interactionWrapper.getSenderGuildMemberWrapper();

        if (guild == null && member == null)
            throw new SemanticError(`This command cannot be used by DM.`);

        return guild.memberHasGameMasterRole(member);
    };

    _interactionWrapper.isSenderGuildOwner = () =>
    {
        const guild = _interactionWrapper.getGuildWrapper();
        const senderId = _interactionWrapper.getCommandSenderId();

        if (guild == null)
            throw new SemanticError(`This command cannot be used by DM.`);

        return guild.memberIsOwner(senderId);
    };

    _interactionWrapper.isSenderDev = () =>
    {
        const senderId = _interactionWrapper.getCommandSenderId();
        
        return config.devIds.includes(senderId);
    };

    _interactionWrapper.isSenderGameOrganizer = () =>
    {
        const game = _interactionWrapper.getGameTargetedByCommand();
        const senderId = _interactionWrapper.getCommandSenderId();

        return senderId === game.getOrganizerId();
    };

    _interactionWrapper.isSenderGamePlayer = () =>
    {
        const game = _interactionWrapper.getGameTargetedByCommand();
        const senderId = _interactionWrapper.getCommandSenderId();

        return game.memberIsPlayer(senderId);
    };

    _interactionWrapper.getCommandArgumentsArray = () => 
    {
        const options = _interactionWrapper.getOptions();
        const argsArray = [];
        options.forEach((option) => argsArray.push(option.value));
        return argsArray;
    };

    _interactionWrapper.getMentionedMembers = (optionName) => 
    {
        const mentionedMember = _interactionWrapper.getOptions.getUser(optionName);

        if (mentionedMember == null)
            return [];

        else return [ mentionedMember ];
    };

    _interactionWrapper.getMessageContent = () => 
    {
        const name = _interactionWrapper.getCommandString();
        const options = _interactionWrapper.getOptions();
        var content = name + " ";

        options.forEach((option) => content += " " + option.value.toString());

        return content;
    }
    
    _interactionWrapper.getCommandSenderId = () => _interactionWrapper.getSenderId();
    _interactionWrapper.getCommandSenderUsername = () => _interactionWrapper.getSenderUsername();
    _interactionWrapper.getGameTargetedByCommand = () => _gameTargetedByCommand;

    return _interactionWrapper;
}