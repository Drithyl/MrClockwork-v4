const { deleteAll } = require("../discord/commands/delete");

async function deleteGlobalCommands() {
    try {
        const result = await deleteAll();
        console.log(`Successfully deleted all slash commands globally`);
    }
    catch(error) {
        console.log(`Error deleting slash commands:`);
        console.log(error);
    }
}

deleteGlobalCommands();
