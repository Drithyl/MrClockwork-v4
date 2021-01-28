
/* THIS IS CLIENT-SIDE CODE RUN IN THE USER'S BROWSER; CANNOT USE NODEJS HERE */

updateModAndMapPartials();
$("input[name=server]").on("change", updateModAndMapPartials);

function updateModAndMapPartials()
{
    console.log("Updating mod and map partials...");
    const serverName = $("input[name=server]:checked").val();

    if (serverName == null)
        console.log("No server name available; cannot update mod and map lists.");

    else
    {
        updatePartial(`/update_mod_partial/${serverName}`, "mods_div");
        updatePartial(`/update_map_partial/${serverName}`, "maps_div");
    }
}

function updatePartial(route, containerId)
{
    $.get(route, (htmlResponse) =>
    {
        console.log("Updated partial for " + containerId);
        $(`#${containerId}`).html(htmlResponse);

        //bootstrap-select multi selects need to call this selectpicker "refresh" method when options are programmatically added/removed
        //See: https://developer.snapappointments.com/bootstrap-select/methods/#selectpickerrefresh
        $('.selectpicker').selectpicker('refresh');
    });
}