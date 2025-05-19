const fs = require("fs");
const path = require("path");
const { deleteAll } = require("../discord/commands/delete");
const { devGuildId } = require("../config/config.json");

async function deleteGuildCommands(guildIds) {
    if (guildIds.length === 0) {
        return console.log("The array of guildData was empty; no command was deleted");
    }

    const promises = guildIds.map((id) => deleteAll(id));
    const settledPromises = await Promise.allSettled(promises);

    settledPromises.forEach((result, i) => {
        if (result.status === "rejected") {
            console.log(`Failed to delete slash commands in guild ${guildIds[i]}: ${result.reason}`);
        }
        else {
            console.log(`Successfully deleted commands in guild ${guildIds[i]}`);
        }
    });
}

function getDeployedGuilds() {
    const dataPath = path.resolve("./data/");
    const guildDataPath = path.resolve(dataPath, "guild_data");

    if (fs.existsSync(dataPath) === false) {
        console.log("No data path found");
        return [];
    }

    if (fs.existsSync(guildDataPath) === false) {
        console.log("No guild_data found within the data dir");
        return [];
    }

    const guildDataDirFilenames = fs.readdirSync(guildDataPath);
    return [devGuildId, ...guildDataDirFilenames];
}

const guildsToDelete = getDeployedGuilds();
deleteGuildCommands(guildsToDelete);
