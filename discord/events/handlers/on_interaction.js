module.exports = 
{
	name: "interactionCreate",
	execute(interaction)
	{
        const tag = interaction.user.tag;
        const channelName = interaction.channel.name;
		const client = interaction.client;

		console.log(`${tag} in #${channelName} triggered an interaction.`);

		if (interaction.isChatInputCommand() === true)
			onCommandHandler(interaction, client);

		else if (interaction.isUserContextMenuCommand() === true)
			onCommandHandler(interaction, client);

		else if (interaction.isMessageContextMenuCommand() === true)
			onCommandHandler(interaction, client);

		else if (interaction.isAutocomplete() === true)
			onAutocompleteInteractionHandler(interaction, client);

		else if (interaction.isButton() === true)
			onButtonHandler(interaction, client);

		else if (interaction.isSelectMenu() === true)
			onSelectHandler(interaction, client);

		else if (interaction.isModalSubmit() === true)
			onModalSubmitHandler(interaction, client);

		else throw new Error(
			`No handler specified for interaction type: ${interaction.type}`
		);
	},
};

// Will handle both slash commands and context menu commands
async function onCommandHandler(interaction, client)
{
    const command = client.commands.get(interaction.commandName);
	const CommandContext = require("../../wrappers/command_context");
	const commandContext = await CommandContext.create(interaction);

    if (command == null)
        return;

    try
    {
		await commandContext.deferReply();
        await command.execute(commandContext, client);
    }

    catch (error)
    {
        console.error(error);
        await commandContext.reply({
            content: `Command failed: ${error.message}`,
            ephemeral: true
        });
    }
}

// Find the autocomplete function that was defined within this command
// and run it so as to display the autocompleted options for the user.
// Once it's resolved, it will be sent as the command interaction with
// whatever value the user ended up inputting.
async function onAutocompleteInteractionHandler(interaction, client)
{
    const command = client.commands.get(interaction.commandName);

    if (command == null)
        return;

    try
    {
        await command.autocomplete(interaction);
    }

    catch (error)
    {
        console.error(error);
        await interaction.reply({
            content: `Could not autocomplete: ${error.message}`,
            ephemeral: true
        });
    }
}

// Triggers when a button component inside a message was clicked.
// Find the command which contains the component with the right
// customId and execute its corresponding handler.
function onButtonHandler(interaction, client)
{
	const id = interaction.customId;
	const filterFn = command =>
		command.componentHandlers != null &&
		command.componentHandlers[id] != null;

    const command = client.commands.find(filterFn);

	if (command == null)
		throw new Error(`No command has handler for button with id <${id}>`);

	const handler = command.componentHandlers[id];
	handler(interaction, client);
}

// Triggers when an option inside a select component inside a
// message is selected. Find the command which contains the
// component with the right customId and execute its corresponding handler.
function onSelectHandler(interaction, client)
{
	const id = interaction.customId;
	const filterFn = command =>
		command.componentHandlers != null &&
		command.componentHandlers[id] != null;

    const command = client.commands.find(filterFn);

	if (command == null)
		throw new Error(`No command has handler for select with id <${id}>`);

	const handler = command.componentHandlers[id];
	handler(interaction, client);
}

// Triggers when a modal form inside a message is submitted.
// Find the command which contains the component with the
// right customId and execute its corresponding handler.
function onModalSubmitHandler(interaction, client)
{
	const id = interaction.customId;
	const filterFn = command =>
		command.componentHandlers != null &&
		command.componentHandlers[id] != null;

    const command = client.commands.find(filterFn);

	if (command == null)
		throw new Error(`No command has handler for modal with id <${id}>`);

	const handler = command.componentHandlers[id];
	handler(interaction, client);
}
