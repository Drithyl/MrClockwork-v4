

$(document).ready(() =>
{
    const sessionIdInput = $(`input[name="sessionId"]`);
    const sessionIdValue = sessionIdInput.val();
    console.log(sessionIdValue);

    if (sessionIdValue === "none")
        sessionIdInput.val(localStorage.getItem("sessionId"));
});