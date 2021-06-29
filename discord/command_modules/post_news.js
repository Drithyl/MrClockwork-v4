
const log = require("../../logger.js");
const guildStore = require("../guild_store.js");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const commandPermissions = require("../command_permissions.js");

const commandData = new CommandData("POST_NEWS");

module.exports = PostNewsCommand;

function PostNewsCommand()
{
    const postNewsCommand = new Command(commandData);

    postNewsCommand.addBehaviour(_behaviour);

    postNewsCommand.addSilentRequirements(
        commandPermissions.assertMemberIsDev
    );

    return postNewsCommand;
}

function _behaviour(commandContext)
{
    var commandArgumentsArray = commandContext.getCommandArgumentsArray();

    //ignore spaces and join all arguments together, since they are a whole message to post
    var messageString = commandArgumentsArray.join(" ");

    return guildStore.forAllGuilds((guildWrapper) => 
    {
        log.general(log.getNormalLevel(), `Cycling through guild ${guildWrapper.getName()} to post news`);
        return guildWrapper.postNews(messageString)
        .catch((err) => commandContext.respondToCommand(`Error occurred when posting to ${guildWrapper.getName()}:\n\n${err.message}`));
    });
}