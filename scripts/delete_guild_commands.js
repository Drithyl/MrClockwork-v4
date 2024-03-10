const fs = require("fs");
const path = require("path");
const { deleteAll } = require("../discord/commands/delete");

async function deleteGuildCommands(guildIds) {
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
        console.log("No guild_data found within the dara dir");
        return [];
    }

    const guildDataDirFiles = fs.readdirSync(guildDataPath);
    return guildDataDirFiles;
}

const guildsToDelete = getDeployedGuilds();
deleteGuildCommands(guildsToDelete);
