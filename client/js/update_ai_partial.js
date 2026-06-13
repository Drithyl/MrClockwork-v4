
/* THIS IS CLIENT-SIDE CODE RUN IN THE USER'S BROWSER; CANNOT USE NODEJS HERE */

$(document).ready(function() {
    updateNations();
    $("input[name=era]").on("change", updateNations);
});

function updateNations()
{
    const selectedEra = $("input[name=era]:checked").val();
    
    if (selectedEra == null)
        return;

    console.log("Switched to era:", selectedEra);

    forEachEra((eraNumber) =>
    {
        const multiSelect = $(`#input_ai_${eraNumber}`)[0]._multiSelect;

        if (eraNumber == selectedEra)
        {
            console.log(`Enabling ai select for era ${eraNumber}...`);
            multiSelect.enable();
            $(`#ai_${eraNumber}_container`).show();
        }

        else
        {
            console.log(`Disabling ai select for era ${eraNumber}...`);
            $(`#ai_${eraNumber}_container`).hide();
            multiSelect.disable();
            multiSelect.deselectAll();

        }
    });

    $(".selectpicker").selectpicker("refresh");
}

function forEachEra(fn)
{
    for (let i = 1; i <= 3; i++)
        fn(i);
}
