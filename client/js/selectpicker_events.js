$(function () {
    const modPicker = $('#input_mod');
    preservePickOrder(modPicker);

    function preservePickOrder(picker) {
        const options = picker.find('option').toArray();

        picker.on('loaded.bs.select', selectedFirst);
        picker.on('change.bs.select', selectedFirst);

        function selectedFirst () {
            // Get the currently selected options
            const selectedOptions = $(this).find('option:selected');

            // Find the non-selected options among the original list
            const otherOptions = [...options].filter(o => {
                return Array.from(selectedOptions).find(so => {
                    return o.value === so.value;
                }) == null;
            });

            // Add the selected options first
            $(this).prepend(selectedOptions);

            // Then add the non-selected ones
            $(this).append(otherOptions);
            $(this).selectpicker('refresh');
        }
    }
});
