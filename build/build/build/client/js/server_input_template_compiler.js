"use strict";
/* THIS IS CLIENT-SIDE CODE RUN IN THE USER'S BROWSER; CANNOT USE NODEJS HERE */
//Store the parsed data received from the server
var server_data_parsed;
var maps_data_parsed;
var mods_data_parsed;
//Store the name of the selected server at any time
var selected_server_name;
//Fetch the containers where the rendered templates will be displayed
var server_input_container = document.getElementById("server_input_container");
var map_input_container = document.getElementById("input_map");
var mod_input_container = document.getElementById("input_mod");
//Fetch the template source HTML codes
var server_input_template_src = document.getElementById("server_input_template");
var map_input_template_src = document.getElementById("map_input_template");
var mod_input_template_src = document.getElementById("mod_input_template");
//To store generated and rendered templates
var server_input_template;
var map_input_template;
var mod_input_template;
var map_input_template_rendered;
var server_input_template_rendered;
var mod_input_template_rendered;
//Fetch the JSON file that contains the data the servers
//Must be done first and then fetch the data for maps and mods,
//as this data is fetched directly from the selected server
fetchResource("/servers", function (received_servers) {
    server_data_parsed = JSON.parse(received_servers);
    //Set first server as the checked by default; Handlebars template will check this with an {{if}} helper
    server_data_parsed[0].checked = true;
    selected_server_name = server_data_parsed[0].name;
    //Render the template
    server_input_template = Handlebars.compile(server_input_template_src.innerHTML);
    server_input_template_rendered = server_input_template(server_data_parsed);
    //Display it in the container
    server_input_container.innerHTML = server_input_template_rendered;
    //Now render map and mods templates by fetching the map and mods lists from the given server
    _renderMapListFromServer(selected_server_name);
    _renderModListFromServer(selected_server_name);
});
//Called by the era radio button elements whenever they are clicked, passing in the button that was clicked
function updateServer(checked_server_radio_button) {
    checked_server_radio_button.checked = true;
    selected_server_name = checked_server_radio_button.value;
    //Re-render map and mods templates by fetching the map and mods lists from the given server
    _renderMapListFromServer(selected_server_name);
    _renderModListFromServer(selected_server_name);
}
function _renderMapListFromServer(server) {
    //Fetch the JSON file that contains the data for this template
    fetchResource("/maps/" + server, function (maps_data) {
        //Parse the JSON data into a JS Object
        maps_data_parsed = JSON.parse(maps_data);
        //Set first map as the selected by default; Handlebars template will check this with an {{if}} helper
        maps_data_parsed[0].selected = true;
        //Render the template
        map_input_template = Handlebars.compile(map_input_template_src.innerHTML);
        map_input_template_rendered = map_input_template(maps_data_parsed);
        //Display it in the container
        map_input_container.innerHTML = map_input_template_rendered;
        //bootstrap-select multi selects need to call this selectpicker "refresh" method when options are programmatically added/removed
        //See: https://developer.snapappointments.com/bootstrap-select/methods/#selectpickerrefresh
        $('.selectpicker').selectpicker('refresh');
    });
}
function _renderModListFromServer(server) {
    //Fetch the JSON file that contains the data for this template
    fetchResource("/mods/" + server, function (mods_data) {
        //Parse the JSON data into a JS Object
        mods_data_parsed = JSON.parse(mods_data);
        //Render the template
        mod_input_template = Handlebars.compile(mod_input_template_src.innerHTML);
        mod_input_template_rendered = mod_input_template(mods_data_parsed);
        //Display it in the container
        mod_input_container.innerHTML = mod_input_template_rendered;
        //bootstrap-select multi selects need to call this selectpicker "refresh" method when options are programmatically added/removed
        //See: https://developer.snapappointments.com/bootstrap-select/methods/#selectpickerrefresh
        $('.selectpicker').selectpicker('refresh');
    });
}
//Original function taken from https://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
//and adapted to take a path argument
function fetchResource(path, cb) {
    var xmlRequest = new XMLHttpRequest();
    xmlRequest.overrideMimeType("application/json");
    xmlRequest.open('GET', path, true);
    xmlRequest.onreadystatechange = function () {
        if (xmlRequest.readyState == 4 && xmlRequest.status == "200") {
            cb(xmlRequest.responseText);
        }
    };
    xmlRequest.send(null);
}
//# sourceMappingURL=server_input_template_compiler.js.map