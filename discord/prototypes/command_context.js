
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
    this.getSenderGuildMemberWrapper = () => _messageWrapper.getSenderGuildMemberWrapper();
    this.getGameTargetedByCommand = () => _gameTargetedByCommand;
    this.getDestinationChannel = () => _targetChannelObject;

    this.respondToCommand = (...args) => _messageWrapper.respond(...args);
    this.respondToSender = (...args) => _messageWrapper.respondToSender(...args);
}

function _extractCommandString(messageContent)
{
    var messageWords = messageContent.split(/ +/);
    var command = messageWords.shift().toLowerCase();
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