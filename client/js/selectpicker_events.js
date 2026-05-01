$(document).ready(() =>
{
    const picker = $('#input_mod');

    picker.on('loaded.bs.select', selectedFirst);
    picker.on('change.bs.select', selectedFirst);

    function selectedFirst () {
        $(this).find('option:selected').prependTo(this);
        $(this).selectpicker('refresh');
    }
});
