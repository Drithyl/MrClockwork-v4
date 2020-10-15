"use strict";
/* THIS IS CLIENT-SIDE CODE RUN IN THE USER'S BROWSER; CANNOT USE NODEJS HERE */
var nations_data_parsed;
var era_nations;
//Fetch the container where the rendered template will be displayed, as well as the template's source HTML
var ai_input_container = document.getElementById("input_ai");
var ai_input_template_src = document.getElementById("ai_input_template");
//Compile the template
var ai_input_template;
var ai_input_template_rendered;
//Fetch the JSON file that contains the data for this template
fetchDom5NationsJSON(function (nations_data) {
    //Parse the JSON data into a JS Object
    nations_data_parsed = JSON.parse(nations_data);
    //Make the era displayed by default be EA, or "1" in the JSON data
    era_nations = nations_data_parsed["1"];
    //Render the template
    ai_input_template = Handlebars.compile(ai_input_template_src.innerHTML);
    ai_input_template_rendered = ai_input_template(era_nations);
    //Display it in the container
    ai_input_container.innerHTML = ai_input_template_rendered;
    //bootstrap-select multi selects need to call this selectpicker "refresh" method when options are programmatically added/removed
    //See: https://developer.snapappointments.com/bootstrap-select/methods/#selectpickerrefresh
    $('.selectpicker').selectpicker('refresh');
});
//Called by the era radio button elements whenever they are clicked, passing in the button that was clicked
function updateEra(checked_era_radio_button) {
    var value = checked_era_radio_button.value;
    era_nations = { "ai_nations": nations_data_parsed[value] };
    //Render the template
    ai_input_template_rendered = ai_input_template(era_nations);
    //Display it in the container
    ai_input_container.innerHTML = ai_input_template_rendered;
    //bootstrap-select multi selects need to call this selectpicker "refresh" method when options are programmatically added/removed
    //See: https://developer.snapappointments.com/bootstrap-select/methods/#selectpickerrefresh
    $('.selectpicker').selectpicker('refresh');
}
//Original function taken from https://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
//and adapted to take a path argument
function fetchDom5NationsJSON(cb) {
    var xmlRequest = new XMLHttpRequest();
    var path = "/nations";
    xmlRequest.overrideMimeType("application/json");
    xmlRequest.open('GET', path, true);
    xmlRequest.onreadystatechange = function () {
        if (xmlRequest.readyState == 4 && xmlRequest.status == "200") {
            cb(xmlRequest.responseText);
        }
    };
    xmlRequest.send(null);
}
//# sourceMappingURL=ai_input_template_compiler.js.map