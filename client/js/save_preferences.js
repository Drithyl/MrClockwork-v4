

function savePreferences()
{
    var url_encoded_data = $("#preferences_form").serialize();

    //get authentication params from the url and include them in the data
    const userIdParam = window.location.search.replace(/^.+userId=(\d+)&token.+/i, "$1");
    const tokenParam = window.location.search.replace(/^.+&token=/i, "");

    url_encoded_data += `&userId=${userIdParam}&token=${tokenParam}`;

    var xmlRequest = new XMLHttpRequest();

    xmlRequest.addEventListener("load", (event) =>
    {
        console.log("Data sent and response loaded.");
    });

    xmlRequest.addEventListener("error", (event) =>
    {
        console.log(`Error:`, event);
    });

    xmlRequest.onreadystatechange = function () 
    {
        if (xmlRequest.readyState == 4 && xmlRequest.status == "200") 
        {
            console.log(xmlRequest.responseText);
        }
    };
    
    xmlRequest.open('POST', "/preferences", true);
    xmlRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlRequest.send(url_encoded_data);  
}