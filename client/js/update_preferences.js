
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

// Catch the form submission
$("#preferences_form").submit(function()
{
    var form = $(this);

    // Get all the checkboxes in the form
    var checkboxes = form.find('input[type="checkbox"]');

    // Iterate through them to check if they are checked
    checkboxes.each(function()
    {
        var checkbox = $(this);
        var hiddenInput = form.find(`input[type="hidden"][name="${checkbox.attr("name")}"]`);

        // If they are checked, then disable the hidden input that has their same name,
        // as their 'off' value is not required. These hidden inputs are there because
        // checkboxes that are unchecked will send no value at all in POST to the server
        if (checkbox.is(":checked") === true)
            hiddenInput.prop("disabled", true);
    });
});