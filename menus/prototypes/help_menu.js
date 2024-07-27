
const helpMenuEntries = require("../../json/help_menu_entries.json");
const MessagePayload = require("../../discord/prototypes/message_payload.js");

module.exports = HelpMenu;

function HelpMenu(userWrapper)
{
    const _userWrapper = userWrapper;
    const _helpIntro = _composeHelpIntro();
    
    this.startMenu = async () =>
    {
        const messageWrapper = await _userWrapper.sendMessage(new MessagePayload(_helpIntro));

        for (const entry of helpMenuEntries) {
            if (entry.EMOJI == null)
                continue;

            await messageWrapper.react(entry.EMOJI);
        }
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