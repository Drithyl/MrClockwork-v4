



function requestHosting()
{
    var xmlRequest = new XMLHttpRequest();
    const url_encoded_data = $("#request_hosting_form").serialize();
    const userId = url_encoded_data.replace(/userId=(\d+)&token.+/i, "$1");
    const token = url_encoded_data.replace(/^.+&token=/i, "");

    console.log(`Extracted userId param from URL:`, userId);
    console.log(`Extracted token param from URL:`, token);

    console.log(userId);
    console.log(token);

    xmlRequest.addEventListener("load", (event) =>
    {
        console.log("Data sent and response loaded.");
        console.log(event);
    });

    xmlRequest.addEventListener("error", (event) =>
    {
        console.log(`Error:`, event);
    });
    
    xmlRequest.open('GET', `/${userId}/${token}/`, true);
    xmlRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlRequest.send(url_encoded_data);
}