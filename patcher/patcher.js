
const gamePatcher = require("./game_patcher.js");
const guildPatcher = require("./guild_patcher.js");

exports.module.runPatchers = () =>
{
    try
    {
        guildPatcher();
        await gamePatcher();
    }

    catch(err)
    {
        throw new Error(`PATCHING ERROR: ${err.message}`);
    }
};

