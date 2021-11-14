
var lastSelectedGameName;

/** See docs @ https://developer.snapappointments.com/bootstrap-select/options/#events */
/** Triggers when another game is selected and displays the current preferences
 *  for that game, while hiding the previous one's so as to not overlap.
 */
$("#game_select").on("changed.bs.select", function(e, clickedIndex, isSelected, oldValue)
{
    const gameName = $(this).find("option").eq(clickedIndex).val();

    $(`div[name=game_container]`).hide();
    $(`#${gameName}_container`).show();

});