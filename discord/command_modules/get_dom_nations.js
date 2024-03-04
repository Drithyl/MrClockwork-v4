
const asserter = require("../../asserter.js");
const config = require("../../config/config.json");
const Command = require("../prototypes/command.js");
const CommandData = require("../prototypes/command_data.js");
const MessagePayload = require("../prototypes/message_payload.js");
const dom5NationsByEraNumber = require("../../json/dom5_nations.json");
const dom6NationsByEraNumber = require("../../json/dom6_nations.json");

const commandData = new CommandData("GET_NATIONS");

module.exports = GetNationsCommand;

function GetNationsCommand()
{
    const getNationsCommand = new Command(commandData);

    getNationsCommand.addBehaviour(_behaviour);

    return getNationsCommand;
}

function _behaviour(commandContext)
{
    const commandArguments = commandContext.getCommandArgumentsArray();
    const gameType = commandArguments[0];

    if (asserter.isValidGameType(gameType) === false)
        return commandContext.respondToCommand(new MessagePayload(`You must specify the game for which you want to get a list of nations. Either ${config.dom5GameTypeName} or ${config.dom6GameTypeName}`));

    var introductionString = `Below is the list of ${gameType} nation numbers, names and filenames for your convenience:\n\n`;
    var nationListString = formatNationListString();

    return commandContext.respondToCommand(new MessagePayload(introductionString, nationListString.toBox(), true, "```"));
}

function formatNationListString(gameType)
{
    var stringList = "";
    let nationsByEraNumber = (asserter.isDom5GameType(gameType) === true) ?
        dom5NationsByEraNumber :
        dom6NationsByEraNumber;

    for (var eraNumber in nationsByEraNumber)
    {
        var arrayOfNationsInEra = nationsByEraNumber[eraNumber];
        var eraName = translateEraNumberToName(eraNumber);

        stringList += `\n\n- ${eraName} NATIONS:\n\n`;

        arrayOfNationsInEra.forEach((nationData) =>
        {
            stringList += `${nationData.number.toString().width(4)} ${nationData.name.width(12)} ${nationData.filename}\n`;
        });
    }

    return stringList;
}

function translateEraNumberToName(eraNumber)
{
    if (eraNumber === "1")
        return "EARLY AGE";
    
    else if (eraNumber === "2")
        return "MIDDLE AGE";
    
    else if (eraNumber === "3")
        return "LATE AGE";

    else return eraNumber;
}