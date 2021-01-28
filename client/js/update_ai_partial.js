
/* THIS IS CLIENT-SIDE CODE RUN IN THE USER'S BROWSER; CANNOT USE NODEJS HERE */

updateNations();
$("input[name=era]").on("change", updateNations);

function updateNations()
{
    const selectedEra = $("input[name=era]:checked").val();
    
    if (selectedEra == null)
        return;

    console.log("Switched to era:", selectedEra);

    forEachEra((eraNumber) =>
    {
        if (eraNumber == selectedEra)
        {
            console.log(`Enabling ai select for era ${eraNumber}...`);
            $(`#input_ai_${eraNumber}`).prop("disabled", false);
            $(`#ai_${eraNumber}_container`).show();
        }

        else
        {
            console.log(`Disabling ai select for era ${eraNumber}...`);
            $(`#ai_${eraNumber}_container`).hide();
            $(`#input_ai_${eraNumber}`).prop("disabled", true);
        }
    });

    $('.selectpicker').selectpicker('refresh');
}

function forEachEra(fn)
{
    for (var i = 1; i <= 3; i++)
        fn(i);
}