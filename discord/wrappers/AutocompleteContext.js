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
}

module.exports = AutocompleteContext;
