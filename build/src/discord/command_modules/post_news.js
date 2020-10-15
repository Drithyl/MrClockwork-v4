"use strict";
var guildStore = require("../guild_store.js");
var Command = require("../prototypes/command.js");
var CommandData = require("../prototypes/command_data.js");
var commandPermissions = require("../command_permissions.js");
var commandData = new CommandData("POST_NEWS");
module.exports = PostNewsCommand;
function PostNewsCommand() {
    var postNewsCommand = new Command(commandData);
    postNewsCommand.addBehaviour(_behaviour);
    postNewsCommand.addSilentRequirements(commandPermissions.assertMemberIsDev);
    return postNewsCommand;
}
function _behaviour(commandContext) {
    var commandArgumentsArray = commandContext.getCommandArgumentsArray();
    //ignore spaces and join all arguments together, since they are a whole message to post
    var messageString = commandArgumentsArray.join(" ");
    return guildStore.forEachGuildAsync(function (guildWrapper) {
        console.log("Cycling through guild " + guildWrapper.getName());
        return guildWrapper.postNews(messageString)
            .catch(function (err) {
            commandContext.respondToCommand("Error occurred when posting to " + guildWrapper.getName() + ":\n\n" + err.message);
            return Promise.resolve();
        });
    });
}
//# sourceMappingURL=post_news.js.map