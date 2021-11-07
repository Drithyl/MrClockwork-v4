$(document).ready(() =>
{
    const sessionIdInput = $(`input[name="sessionId"]`);
    const sessionIdValue = sessionIdInput.val();
    console.log(`Stored sessionId is ${localStorage.getItem("sessionId")}`);

    if (sessionIdValue === "none" || sessionIdValue == null)
        sessionIdInput.val(localStorage.getItem("sessionId"));
});