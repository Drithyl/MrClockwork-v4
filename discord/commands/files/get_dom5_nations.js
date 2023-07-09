
const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const dom5NationsByEraNumber = require("../../../json/dom5_nations.json");


const ERA_OPTION = "era";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("nations")
		.setDescription("Prints a list of all the Dominions 5's nations and their nation_numbers and filenames.")
        .addStringOption(option =>
            option.setName(ERA_OPTION)
            .setDescription("An era if you wish to only check those specific nations.")
            .addChoices(...getStringOptionChoices())
        ),

	execute: behaviour
};


function behaviour(commandContext)
{
    const eraOption = commandContext.options.getString(ERA_OPTION);
    let introductionString = "Below is the list of nation numbers, names and filenames for your convenience:\n\n";
    let nationListString = formatNationListString(eraOption);

    return commandContext.respondToCommand(new MessagePayload(introductionString, nationListString.toBox(), true, "```"));
}

function formatNationListString(eraNumber = null)
{
    let stringList = "";
    let erasToList = [1, 2, 3];

    if (eraNumber != null)
        erasToList = [ +eraNumber ];

    erasToList.forEach((eraNumber) =>
    {
        const arrayOfNationsInEra = dom5NationsByEraNumber[eraNumber];
        const eraName = translateEraNumberToName(eraNumber);

        stringList += `\n\n- ${eraName} NATIONS:\n\n`;

        arrayOfNationsInEra.forEach((nationData) =>
        {
            stringList += `${nationData.number.toString().width(4)} ${nationData.name.width(12)} ${nationData.filename}\n`;
        });
    });

    return stringList;
}

function translateEraNumberToName(eraNumber)
{
    if (eraNumber == 1)
        return "EARLY AGE";
    
    else if (eraNumber == 2)
        return "MIDDLE AGE";
    
    else if (eraNumber == 3)
        return "LATE AGE";

    else return eraNumber;
}


function getStringOptionChoices()
{
    return [
        { name: "Early Age", value: "1" },
        { name: "Middle Age", value: "2" },
        { name: "Late Age", value: "3" }
    ];
}