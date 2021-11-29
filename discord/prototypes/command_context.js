
const config = require("../../config/config.json");
const { SemanticError } = require("../../errors/custom_errors");
const ongoingGamesStore = require("../../games/ongoing_games_store.js");

module.exports = CommandContext;

function CommandContext(messageWrapper)
{
    const _messageWrapper = messageWrapper;
    const _messageContent = messageWrapper.getMessageContent();
    const _targetChannelObject = messageWrapper.getDestinationChannel();
    const _commandString = _extractCommandString(_messageContent);
    const _commandArgumentsArray = _extractCommandArgumentsAsArray(_messageContent);
    const _gameTargetedByCommand = ongoingGamesStore.getOngoingGameByChannel(_targetChannelObject.id);
    
    this.isGameCommand = () => _gameTargetedByCommand != null;

    this.wasSentByDm = () => _messageWrapper.isDirectMessage();
    this.hasArgumentByRegexp = (regexp) =>
    {
        for (var i = 0; i < _commandArgumentsArray.length; i++)
            if (regexp.test(_commandArgumentsArray[i]) === true)
                return true;

        return false;
    };

    /* only available if command was sent in a guild channel */
    this.getGuildWrapper = () => _messageWrapper.getDestinationGuildWrapper();
    this.getSenderGuildMemberWrapper = () => _messageWrapper.getSenderGuildMemberWrapper();

    this.isSenderTrusted = () =>
    {
        const guild = this.getGuildWrapper();
        const member = this.getSenderGuildMemberWrapper();

        if (guild == null && member == null)
            throw new SemanticError(`This command cannot be used by DM.`);

        return guild.memberHasTrustedRole(member);
    };

    this.doesSenderHaveOrganizerPermissions = () =>
    {
        const guild = this.getGuildWrapper();
        const member = this.getSenderGuildMemberWrapper();

        if (guild == null && member == null)
            throw new SemanticError(`This command cannot be used by DM.`);

        if (this.isSenderGameOrganizer() === true ||
            this.isSenderGameMaster() === true ||
            this.isSenderGuildOwner() === true ||
            this.isSenderDev() === true)
            return true;

        else return false;
    };

    this.isSenderGameMaster = () =>
    {
        const guild = this.getGuildWrapper();
        const member = this.getSenderGuildMemberWrapper();

        if (guild == null && member == null)
            throw new SemanticError(`This command cannot be used by DM.`);

        return guild.memberHasGameMasterRole(member);
    };

    this.isSenderGuildOwner = () =>
    {
        const guild = this.getGuildWrapper();
        const senderId = this.getCommandSenderId();

        if (guild == null)
            throw new SemanticError(`This command cannot be used by DM.`);

        return guild.memberIsOwner(senderId);
    };

    /************************************************************/

    this.isSenderDev = () =>
    {
        const senderId = this.getCommandSenderId();
        
        return config.devIds.includes(senderId);
    };

    this.isSenderGameOrganizer = () =>
    {
        const game = this.getGameTargetedByCommand();
        const senderId = this.getCommandSenderId();

        return senderId === game.getOrganizerId();
    };

    this.isSenderGamePlayer = () =>
    {
        const game = this.getGameTargetedByCommand();
        const senderId = this.getCommandSenderId();

        return game.memberIsPlayer(senderId);
    };

    this.getCommandString = () => _commandString;
    this.getCommandArgumentsArray = () => [..._commandArgumentsArray];
    this.getMentionedMembers = () => _messageWrapper.getMentionedMembers();
    this.getMessageContent = () => _messageWrapper.getMessageContent().slice(1);
    
    this.getCommandSenderId = () => _messageWrapper.getSenderId();
    this.getCommandSenderUsername = () => _messageWrapper.getSenderUsername();
    this.getSenderUserWrapper = () => _messageWrapper.getSenderUserWrapper();
    this.getGameTargetedByCommand = () => _gameTargetedByCommand;
    this.getDestinationChannel = () => _targetChannelObject;

    this.respondToCommand = (messagePayload) => _messageWrapper.respond(messagePayload);
    this.respondToSender = (messagePayload) => _messageWrapper.respondToSender(messagePayload);
    this.respondByDm = (messagePayload) => _messageWrapper.respondToSender(messagePayload);
}

function _extractCommandString(messageContent)
{
    var messageWords = messageContent.split(/ +/);
    var command = messageWords.shift().toLowerCase();

    if (command[0] === config.commandPrefix)
        return command.slice(1);
        
    return command;
}

function _extractCommandArgumentsAsArray(messageContent)
{
    var messageWords = messageContent.split(/ +/);
    messageWords.shift();

    if (messageWords == null)
        return [];
        
    return messageWords;
}