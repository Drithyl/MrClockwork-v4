

$("#host_game_form").submit(function(eventObj)
{
    eventObj.preventDefault();
    console.log(eventObj);

    var urlEncodedData = $("#host_game_form").serialize();
    console.log(urlEncodedData);

    $.post("/host_game", urlEncodedData)
    .done((response) =>
    {
        console.log(response);
    });
})

/*function hostGame(sessionToken)
{
    console.log("TOKEN " + sessionToken);
    var url_encoded_data = $("#host_game_form").serialize();
    url_encoded_data += `&token=${sessionToken}`;

    $.post("/host_game", url_encoded_data)
    .done((response) =>
    {
        console.log(response);
    }); 
}*/