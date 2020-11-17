

function savePreferences(sessionToken, gamePreferences)
{
    $.post("/save_preferences", Object.assign({ token: sessionToken }, gamePreferences))
    .done((response) =>
    {
        console.log(response);
    }); 
}