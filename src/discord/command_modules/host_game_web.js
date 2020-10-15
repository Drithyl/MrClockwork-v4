
const uuidv4 = require("uuid").v4;
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");
const Dominions5Game = require("../../games/prototypes/dominions5_game.js");
const hostingSessionsStore = require("../../servers/hosting_sessions_store.js");

const hostServerStore = require("../../servers/host_server_store.js");
const { SemanticError } = require("../../errors/custom_errors.js");


const commandData = new CommandData("HOST_DOM5_GAME_WEB");


module.exports = HostDom5GameWebCommand;

function HostDom5GameWebCommand()
{
    const hostDom5GameCommand = new Command(commandData);

    hostDom5GameCommand.addBehaviour(_behaviour);

    hostDom5GameCommand.addRequirements(
        commandPermissions.assertMemberIsTrusted,
        _isThereHostingSpaceAvailableOrThrow
    );

    return hostDom5GameCommand;
}

function _behaviour(commandContext)
{
    const guildMemberWrapper = commandContext.getSenderGuildMemberWrapper();
    const userId = guildMemberWrapper.getId();
    const token = uuidv4();
    const newGameObject = new Dominions5Game();

    newGameObject.setOrganizer(guildMemberWrapper);
    hostingSessionsStore.addSession(userId, token, newGameObject);

    return guildMemberWrapper.sendMessage(`You can begin the hosting process by accessing the link http://localhost:3000/host_game?userId=${userId}&token=${token} on your browser.`);
}

function _isThereHostingSpaceAvailableOrThrow()
{
    var isThereSpace = hostServerStore.isThereHostingSpaceAvailable();

    if (isThereSpace === false)
        throw new SemanticError(`There are currently no available slots in any online server to host a game.`);
}