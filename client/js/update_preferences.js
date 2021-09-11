
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

    // When using the options object as parameter to ensure that
    // values are parsed as json in the server (so that booleabs)
    // are received as that, rather than strings), the done() promise
    // does not get called, but fail() receives the response as if
    // it was an error, even though it's not...
    $.post({
        url: "/edit_preferences",
        contentType: "application/json",
        data: jsonData,
        dataType: "json"
    })
    .done((response) =>
    {
        console.log(response);
        $("#bodySection").html(response);
    })
    .fail((response) =>
    {
        console.log("FAIL", response);
        $("#bodySection").html(response.responseText);
    })
});


/** Turns a serialized data array into JSON. Required because the values of preferences
 *  need to be nested inside objects for each different game, thus why the form names have
 *  a "." separating the game's name and the actual preference key
 */
function _formDataToJson(serializedArray)
{
    const jsonData = {
        sessionId: serializedArray.shift().value
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

        /** Checkbox values here; if they show up in the serialized array it's because
         *  they are "on", or checked, thus assign them as true
         */
        else
        {
            console.log(key + " is " + value);
            jsonData[gameName][key] = true;
        }
    });

    return JSON.stringify(jsonData);
}