
const asserter = require("../../../asserter.js");
const config = require("../../../config/config.json");
const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload.js");
const dom5NationsByEraNumber = require("../../../json/dom5_nations.json");
const dom6NationsByEraNumber = require("../../../json/dom6_nations.json");


const GAME_TYPE_OPTION = "game_type";
const ERA_OPTION = "era";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("nations")
		.setDescription("Prints a list of all the Dominions 5 or 6 nations and their nation numbers and filenames.")
        .addStringOption(option =>
            option.setName(GAME_TYPE_OPTION)
            .setDescription("Whether to fetch Dominions 5 or Dominions 6 nations")
            .addChoices(
                { name: "Dominions 6", value: config.dom6GameTypeName },
                { name: "Dominions 5", value: config.dom5GameTypeName }
            )
			.setRequired(true)
        )
        .addStringOption(option =>
            option.setName(ERA_OPTION)
            .setDescription("An era if you wish to only check those specific nations.")
            .addChoices(...getEraStringOptionChoices())
        ),

	execute: behaviour
};

function behaviour(commandContext)
{
    const gameType = commandContext.options.getString(GAME_TYPE_OPTION);
    const eraOption = commandContext.options.getString(ERA_OPTION);
    const introductionString = `Below is the list of ${gameType} nation numbers, names and filenames for your convenience:\n\n`;
    const nationListString = formatNationListString(eraOption);

    return commandContext.respondToCommand(new MessagePayload(introductionString, nationListString, true, "```"));
}

function formatNationListString(gameType, eraNumber = null)
{
    let stringList = "";
	let erasToList = [1, 2, 3];
    const nationsByEraNumber = (asserter.isDom5GameType(gameType) === true) ?
        dom5NationsByEraNumber :
        dom6NationsByEraNumber;

	if (eraNumber != null)
		erasToList = [ +eraNumber ];

		
	erasToList.forEach((eraNumber) =>
	{
		const arrayOfNationsInEra = nationsByEraNumber[eraNumber];
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
    if (eraNumber === "1")
        return "EARLY AGE";
    
    else if (eraNumber === "2")
        return "MIDDLE AGE";
    
    else if (eraNumber === "3")
        return "LATE AGE";

    else return eraNumber;
}


function getEraStringOptionChoices()
{
    return [
        { name: "Early Age", value: "1" },
        { name: "Middle Age", value: "2" },
        { name: "Late Age", value: "3" }
    ];
}
