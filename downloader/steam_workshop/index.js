const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const log = require("../../logger.js");
const config = require("../../config/config.json");
const STEAMCMD_USER = config.steamcmdUsername;
const START_OF_ITEM_STATUS_LINE = "- Item ";
const UPDATE_REQUIRED_STRING = "update required";
const STEAMCMD_PATH = config.pathToSteamcmd;
const SteamCMD = require("./SteamCMD");
const ACFParser = require("./ACFParser.js");


module.exports = async function downloadWorkshopItem(steamGameId, workshopItemId) {
    const steamcmdArgs = [
        "+login", STEAMCMD_USER,
        "+workshop_download_item", steamGameId, workshopItemId,
        "+quit"
    ];

    const resultLog = await SteamCMD.runCommand(steamcmdArgs);
    
};

module.exports.updateWorkshopMods = async function(steamGameId) {
    const idsOfItemsThatNeedUpdating = await _findItemsThatNeedUpdating(steamGameId);
    const resultLog = await _downloadWorkshopItems(steamGameId, idsOfItemsThatNeedUpdating);
    const manifestPath = path.resolve(STEAMCMD_PATH, "steamapps/workshop/", `appworkshop_${steamGameId}.acf`);

    if (fs.existsSync(manifestPath) === false) {
        throw new Error(`Manifest file for app ${steamGameId} does not exist at "${manifestPath}"`);
    }

    const manifestContent = await fsp.readFile(workshopManifestFilepath, "utf8");
    const lastUpdatedTimestampOfItems = await ACFParser.parseWorkshopItemUpdatedTimes(manifestContent);

    
};

function _downloadWorkshopItems(steamGameId, workshopItemIds) {
    const steamcmdArgs = [
        "+login", STEAMCMD_USER
    ];

    if (workshopItemIds == null || workshopItemIds.length === 0) {
        return "Item id list is empty; no items were downloaded";
    }

    workshopItemIds.forEach((id) => steamcmdArgs.push("+workshop_download_item", steamGameId, id));
    steamcmdArgs.push("+quit");

    return SteamCMD.runCommand(steamcmdArgs);
}

function _moveToLocalMods(steamGameId, workshopItemId, lastUpdatedTime) {
    const workshopDownloadsPath = config.pathToWorkshopDownloads;
    const downloadedItemPath = path.resolve(workshopDownloadsPath, steamGameId, workshopItemId);

    // TODO: add logic to determine whether this goes into the local maps or mods folder :/
    const localModPath = path.resolve(config.pathToDom6Data, "")
    
    if (fs.existsSync(downloadedItemPath) === false) {
        throw new Error(`Could not find downloaded item at "${downloadedItemPath}"`);
    }

    
}


async function _findItemsThatNeedUpdating(steamGameId) {
    const commandArgs = [
        "+login", STEAMCMD_USER,
        "+workshop_status", steamGameId,
        "+quit"
    ];

    const resultLog = await SteamCMD.runCommand(commandArgs);
    const logLines = resultLog.split(/\r?\n/);
    const itemLines = logLines.filter((l) => l.includes(START_OF_ITEM_STATUS_LINE));
    const itemsThatNeedUpdating = itemLines.map((l) => {
        if (l.includes(UPDATE_REQUIRED_STRING) === true) {
            return l.match(/\d{10}/)[0];
        }
    });
    
    return itemsThatNeedUpdating;
}
