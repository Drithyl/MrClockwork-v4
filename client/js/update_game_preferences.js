
/* THIS IS CLIENT-SIDE CODE RUN IN THE USER'S BROWSER; CANNOT USE NODEJS HERE */

var selectedGamePreferences;

function updatePreference(element)
{
    if (selectedGamePreferences == null)
        return;

    if (element.checked)
        selectedGamePreferences[element.name] = true;

    else
        selectedGamePreferences[element.name] = false;

    console.log("UPDATED PREFERENCE " + element.id + " TO " + selectedGamePreferences[element.id]);
}

function updateReminder(option)
{
    if (selectedGamePreferences == null)
        return;
        
    if (option.selected)
    {
        console.log("ADDED REMINDER", option.value);
        selectedGamePreferences.reminders.push(option.value);
    }

    else
    {
        const index = selectedGamePreferences.reminders.indexOf(option.value);
        console.log("SPLICED ELEMENT " + selectedGamePreferences.reminders[index] + " AT INDEX " + index);
        selectedGamePreferences.reminders.splice(index, 1);
    }
}

function displayGamePreferences(gamePreferencesData)
{
    selectedGamePreferences = gamePreferencesData;

    turnCheckbox.attributes.checked = false;
    scoresCheckbox.attributes.checked = false;
    reminderWhenTurnDoneCheckbox.attributes.checked = false;
    displayTurnReminders();

    if (typeof typeof selectedGamePreferences.receiveBackups === "boolean")
        turnCheckbox.attributes.checked = selectedGamePreferences.receiveBackups;

    if (typeof typeof selectedGamePreferences.receiveScores === "boolean")
        scoresCheckbox.attributes.checked = selectedGamePreferences.receiveScores;

    if (typeof typeof selectedGamePreferences.receiveReminderWhenTurnIsDone === "boolean")
        reminderWhenTurnDoneCheckbox.attributes.checked = selectedGamePreferences.receiveReminderWhenTurnIsDone;

    if (Array.isArray(selectedGamePreferences.reminders) === false)
        displayTurnReminders(selectedGamePreferences.reminders);
}

function displayTurnReminders(array = [])
{
    reminders.innerHTML = "";

    for (var i = 2; i < 25; i++)
    {
        if (array.includes(i) === true)
            reminders.innerHTML += `<option name="reminders" value=${i} selected onclick="updateReminder(this)">${i}</option>`;

        else reminders.innerHTML += `<option name="reminders" value=${i} onclick="updateReminder(this)">${i}</option>`;
    }

    $('.selectpicker').selectpicker('refresh');
}