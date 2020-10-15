
/* THIS IS CLIENT-SIDE CODE RUN IN THE USER'S BROWSER; CANNOT USE NODEJS HERE */

var guilds_data_parsed;

//Params passed in the url of the page
const userId = window.location.search.replace(/\?userId=(\d+)&token.+/i, "$1");

console.log(`Extracted userId param from URL:`, userId);

//Fetch the container where the rendered template will be displayed, as well as the template's source HTML
var guild_input_container = document.getElementById("guild_input_container");

var guild_input_template_src = document.getElementById("guild_input_template");

//Compile the template
var guild_input_template;

var guild_input_template_rendered;

//Fetch the JSON file that contains the data for this template
fetchUserGuildsJSON((guilds_data) =>
{
    //Parse the JSON data into a JS Object
    guilds_data_parsed = JSON.parse(guilds_data);

    //Set first map as the selected by default; Handlebars template will check this with an {{if}} helper
    guilds_data_parsed[0].checked = true;
    
    //Render the template
    guild_input_template = Handlebars.compile(guild_input_template_src.innerHTML);
    guild_input_template_rendered = guild_input_template(guilds_data_parsed);
    
    //Display it in the container
    guild_input_container.innerHTML = guild_input_template_rendered;
});

//Original function taken from https://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
//and adapted to take a path argument
function fetchUserGuildsJSON(cb) 
{   
    var xmlRequest = new XMLHttpRequest();
    var path = `/guilds/${userId}`;
    
    xmlRequest.overrideMimeType("application/json");
    xmlRequest.open('GET', path, true);
    
    xmlRequest.onreadystatechange = function () 
    {
        if (xmlRequest.readyState == 4 && xmlRequest.status == "200") 
        {
            cb(xmlRequest.responseText);
        }
    };
    
    xmlRequest.send(null);  
}