
/* THIS IS CLIENT-SIDE CODE RUN IN THE USER'S BROWSER; CANNOT USE NODEJS HERE */

updateNations();
$("#host_game_form input[name=era]").on("change", updateNations);

function updateNations()
{
    const era = $("input[name=era]:checked").val();

    $.get(`/update_ai_partial/${era}`, (htmlResponse) =>
    {
        $("#ai_input_div").html(htmlResponse);

        //bootstrap-select multi selects need to call this selectpicker "refresh" method when options are programmatically added/removed
        //See: https://developer.snapappointments.com/bootstrap-select/methods/#selectpickerrefresh
        $('.selectpicker').selectpicker('refresh');
    });
}