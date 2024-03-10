const { SlashCommandBuilder } = require("discord.js");
const MessagePayload = require("../../prototypes/message_payload");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("reload_commands")
		.setDescription("Reloads a command.")
		.addStringOption(option =>
			option.setName("command")
				.setDescription("The command to reload.")
                .setAutocomplete(true)
				.setRequired(true)),

	execute: behaviour,
    autocomplete: autocompleteCommandNames,

    // This command will never be deployed globally; only to a private dev guild
    isDev: true
};

const ALL_COMMANDS_VALUE = "all";

function behaviour(commandContext) {
    const commandNames = fetchCommandsToReload(commandContext);
    const missingCommands = [];
    const erroredCommands = [];
    const reloadedCommands = [];

    commandNames.map((commandName) => {
        const command = commandContext.client.commands.get(commandName);

        if (command == null) {
            console.log(`Command ${commandName} does not exist!`);
            return missingCommands.push(commandName);
        }
    
        delete require.cache[require.resolve(`./${command.data.name}.js`)];
    
        try {
            // Delete the require() cache to reload the command file
            commandContext.client.commands.delete(command.data.name);
            const reloadedCommand = require(`./${command.data.name}.js`);
    
            // Set the reloaded command file
            commandContext.client.commands.set(reloadedCommand.data.name, reloadedCommand);
            return reloadedCommands.push(reloadedCommand.data.name);
        } catch (error) {
            console.log(`There was an error while reloading command: ${command.data.name}`);
            console.error(error);
            return erroredCommands.push(command.data.name);
        }
    });

    return commandContext.respondToCommand(new MessagePayload(buildResponse(reloadedCommands, missingCommands, erroredCommands)));
}

function fetchCommandsToReload(commandContext) {
    const commandNameOption = commandContext.options.getString("command", true).toLowerCase();
    const commands = [];

    if (commandNameOption === ALL_COMMANDS_VALUE) {
        commands.push(...commandContext.client.commands.map((c, key) => key));
    }
    else {
        commands.push(commandNameOption);
    }

    return commands;
}

function buildResponse(reloadedCommands, missingCommands, erroredCommands) {
    let response = "";

    if (Array.isArray(reloadedCommands) === true && reloadedCommands.length > 0) {
        response += `__**Reloaded:**__\n\n${reloadedCommands.join(", ")}`;
    }
    else if (Array.isArray(missingCommands) === true && missingCommands.length > 0) {
        response += `\n\n__**Missing:**__\n\n${missingCommands.join(", ")}`;
    }
    else if (Array.isArray(erroredCommands) === true && erroredCommands.length > 0) {
        response += `\n\n__**Errored:**__\n\n${erroredCommands.join(", ")}`;
    }

    return response;
}

async function autocompleteCommandNames(autocompleteContext)
{
    // Returns the value of the option currently
    // being focused by the user. "true" makes it
    // return the whole focused object instead of
    // its string value. This way we can access the
    // name of the focused value as well.
    const focusedOption = autocompleteContext.options.getFocused(true);

    try {
        const choices = autocompleteContext.client.commands.map((c, key) => key);
        choices.unshift(ALL_COMMANDS_VALUE);
    
        // Filter choices based on our focused value
        const filtered = choices.filter(choice =>
            choice.toLowerCase().includes(focusedOption.value)
        );
    
        // Respond with the list of choices that match
        // the focused value, like an autocomplete
        await autocompleteContext.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    }

    // Probably would error out if game's server is offline and can't fetch pretenders
    catch(error) {
        await autocompleteContext.respond([]);
    }
}
