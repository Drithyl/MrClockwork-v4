const InteractionContext = require("./InteractionContext.js");

class AutocompleteContext extends InteractionContext
{
    constructor(interactionBase)
    {
        super(interactionBase);
        this.isAutocompleteInteraction = true;
        this.options = interactionBase.options;
        this.optionsArray = interactionBase.options.data;
    }

    async initialize()
    {
		await super.initialize();
    }

    static async create(commandInteraction)
    {
        const instance = new AutocompleteContext(commandInteraction);
        await instance.initialize();
        return instance;
    }

    respond(...args) {
        return this.interactionBase.respond(...args);
    }

    /**
     * Spews out the autocompleted choices available to the user to pick from,
     * and ensures that the name field will be of a length of 25 or less, as
     * expected by the Discord API.
     * @param {Array<Object>} choices - An array of objects with a "name" and a "value" property
     */
    async autocomplete(choices) {
        const focusedOption = this.options.getFocused(true);

        // Cut off all name fields that are longer than 25 chars
        choices.forEach((c) => {
            if (c.name != null && c.name.length > 25) {
                c.name = c.name.slice(0, 22) + "...";
            }
        });

        // Filter choices based on the focused value
        const filtered = choices.filter(choice =>
            choice.name.toLowerCase().includes(focusedOption.value)
        );

        // Respond with the list of choices that match
        // the focused value, like an autocomplete
        await this.respond(filtered);
    }
}

module.exports = AutocompleteContext;
