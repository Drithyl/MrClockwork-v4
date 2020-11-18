
var lastSelectedGameName;

/** See docs @ https://developer.snapappointments.com/bootstrap-select/options/#events */
/** Triggers when another game is selected and displays the current preferences
 *  for that game, while hiding the previous one's so as to not overlap.
 */
$("#input_game").on("changed.bs.select", function(e, clickedIndex, isSelected, oldValue)
{
    const gameName = $(this).find("option").eq(clickedIndex).val();

    $(`#${lastSelectedGameName}_container`).hide();
    $(`#${gameName}_container`).show();

    console.log(`Switching to ${gameName} from ${lastSelectedGameName}`);
    lastSelectedGameName = gameName;
});

/** Catches the submit event and turns the form data into JSON */
$("#preferences_form").submit(function(event)
{
    event.preventDefault();
    const formDataArray = $(this).serializeArray();
    const jsonData = _formDataToJson(formDataArray);

    $.post("/edit_preferences", jsonData)
    .done((response) =>
    {
        console.log(response);
    });
});


/** Turns a serialized data array into JSON. Required because the values of preferences
 *  need to be nested inside objects for each different game, thus why the form names have
 *  a "." separating the game's name and the actual preference key
 */
function _formDataToJson(serializedArray)
{
    const jsonData = {
        token: serializedArray.shift().value
    };

    serializedArray.forEach((dataObject) =>
    {
        const name = dataObject.name;
        const value = dataObject.value;
        const gameNameKeyPair = name.split(".");
        const gameName = gameNameKeyPair.shift();
        const key = gameNameKeyPair.shift();

        if (jsonData[gameName] == null)
            jsonData[gameName] = {};

        if (key === "reminders")
        {
            if (Array.isArray(jsonData[gameName][key]) === false)
                jsonData[gameName][key] = [];

            jsonData[gameName][key].push(+value);
        }

        else jsonData[gameName][key] = true;
    });

    return jsonData;
}