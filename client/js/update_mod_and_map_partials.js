
/* THIS IS CLIENT-SIDE CODE RUN IN THE USER'S BROWSER; CANNOT USE NODEJS HERE */

updateModAndMapPartials();
$("#host_game_form input").on("change", updateModAndMapPartials);

function updateModAndMapPartials()
{
    const serverName = $("input[name=server]:checked").val();

    updatePartial(`/update_mod_partial/${serverName}`, "mods_div");
    updatePartial(`/update_map_partial/${serverName}`, "maps_div");
}

function updatePartial(route, containerId)
{
    $.get(route, (htmlResponse) =>
    {
        $(`#${containerId}`).html(htmlResponse);

        //bootstrap-select multi selects need to call this selectpicker "refresh" method when options are programmatically added/removed
        //See: https://developer.snapappointments.com/bootstrap-select/methods/#selectpickerrefresh
        $('.selectpicker').selectpicker('refresh');
    });
}