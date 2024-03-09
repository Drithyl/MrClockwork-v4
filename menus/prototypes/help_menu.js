
const helpMenuEntries = require("../../json/help_menu_entries.json");
const MessagePayload = require("../../discord/prototypes/message_payload.js");

module.exports = HelpMenu;

function HelpMenu(userWrapper)
{
    const _userWrapper = userWrapper;
    const _helpIntro = _composeHelpIntro();
    
    this.startMenu = () =>
    {
        return _userWrapper.sendMessage(new MessagePayload(_helpIntro))
        .then((messageWrapper) => 
        {
            return helpMenuEntries.forEachPromise((entry, i, nextPromise) =>
            {
                if (entry.EMOJI == null)
                    return nextPromise();

                return messageWrapper.react(entry.EMOJI)
                .then(() => nextPromise());
            });
        });
    };

    this.handleReaction = (emoji, reactedMessageWrapper) =>
    {
        let reactedEntry = helpMenuEntries.find((entry) => entry.EMOJI == emoji.name);

        if (typeof reactedEntry === "object")
            return reactedMessageWrapper.respond(new MessagePayload(`*\n*\n*\n**__${reactedEntry.ENTRY}__**\n\n${reactedEntry.INFO}`));
    };

    this.handleInput = () =>
    {

    };
}

function _composeHelpIntro()
{
    let intro = "";

    helpMenuEntries.forEach((entry) =>
    {
        if (typeof entry === "string")
            intro += entry + "\n\n";

        else intro += `${entry.EMOJI} **${entry.ENTRY}**\n\n`
    });

    return intro;
}