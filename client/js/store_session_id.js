$(document).ready(() =>
{
    const sessionIdInput = $(`input[name="sessionId"]`);
    const sessionIdValue = sessionIdInput.val();

    if (sessionIdValue != null && sessionIdValue !== "none")
    {
        console.log(`Stored ${sessionIdValue}`);
        localStorage.setItem("sessionId", sessionIdValue);
    }
});