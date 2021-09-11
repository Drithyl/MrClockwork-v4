

$(document).ready(() =>
{
    const sessionIdInput = $(`input[name="sessionId"]`);
    const sessionIdValue = sessionIdInput.val();
    console.log(sessionIdValue);

    if (sessionIdValue != null && sessionIdValue !== "none")
        localStorage.setItem("sessionId", sessionIdValue);
});