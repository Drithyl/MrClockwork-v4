
const fs = require("fs");
const path = require("path");
const fsp = require("fs").promises;
const log = require("../logger.js");
const asserter = require("../asserter.js");
const config = require("../config/config.json");
const { getDominionsMapsPath, getDominionsModsPath } = require("../helper_functions.js");

const GoogleDriveFile = require("./google_drive_api/GoogleDriveFile.js");
const Zipfile = require("./Zipfile.js");
const Dom6MapButDom5UploadError = require("./errors/Dom6MapButDom5UploadError.js");
const NoKeyFileInZipError = require("./errors/NoKeyFileInZipError.js");
const NestedKeyFileError = require("./errors/NestedKeyFileError.js");
const KeyFileContainsWhitespaceError = require("./errors/KeyFileContainsWhitespaceError.js");

//These are the extensions expected in the collection of map files
const ALLOWED_MAP_EXTENSIONS = [ "", ".map", ".d6m", ".rgb", ".tga", ".png" ];

//These are the extensions expected in the collection of mod files
const ALLOWED_MOD_EXTENSIONS = [ "", ".dm", ".rgb", ".tga", ".png", ".sw", ".wav" ];

// Temporary path to which zipfiles get downloaded
const TMP_PATH = `${config.dataPath}/tmp`;

// Max file size of a zipfile to download
const MAX_ZIP_SIZE_IN_MB = config.maxZipfileSizeInMB;

// Max files allowed inside of a zipfile
const MAX_ENTRIES = config.maxZipfileEntries;


if (fs.existsSync(TMP_PATH) === false)
    fs.mkdirSync(TMP_PATH);


module.exports.downloadFileFromDrive = async (driveLink, gameType) => {

    const googleDriveId = GoogleDriveFile.extractGoogleDriveFileId(driveLink);
    const googleDriveFile = new GoogleDriveFile(googleDriveId);
    googleDriveFile.setMaxFileSize(MAX_ZIP_SIZE_IN_MB);

    log.upload(log.getNormalLevel(), `Obtaining authorization from Google Drive API...`);
    await googleDriveFile.authorizeGoogleDriveAPI();

    log.upload(log.getNormalLevel(), `Obtaining metadata of file id ${googleDriveId}...`);
    await googleDriveFile.fetchMetadata();

    log.upload(log.getNormalLevel(), `Downloading and fetching zipfile ${googleDriveId}...`);
    const downloadPath = `${TMP_PATH}/${googleDriveFile.metadata.name}`;
    await googleDriveFile.downloadFile(downloadPath);

    const zipfile = new Zipfile(downloadPath);
    zipfile.setMaxEntries(MAX_ENTRIES);

    log.upload(log.getNormalLevel(), `Exploring zip file...`);
    await zipfile.exploreZip();

    // Ensure zipfile contents are adequate
    _validateZipfile(zipfile);
    
    // Generate the path to unzip the zipfile based on its contents
    const extractPath = await _generateExtractPath(zipfile, gameType);

    // Extract the files to the generated location
    await _extractZipfile(zipfile, extractPath);
    
    // Delete the leftover zipfile after extracting it
    await _cleanupTmpFiles(zipfile.zipfilePath);
};


async function _generateExtractPath(zipfile, gameType) {
    let extractPath = null;

    if (zipfile.containsMap === true)
    {
        if (gameType === config.dom5GameTypeName && zipfile.containsDom6Map === true) {
            throw new Dom6MapButDom5UploadError();
        }

        if (gameType === config.dom5GameTypeName) {
            extractPath = getDominionsMapsPath(gameType);
        }

        // Dom6 stores every map in their own map folder inside of the general maps folder.
        // Check for this folder's existence with the same name as the .d6m file, and create it if it doesn't exist.
        else if (gameType === config.dom6GameTypeName) {
            extractPath = path.resolve(getDominionsMapsPath(gameType), path.parse(zipfile.keyFileName).name);

            if (fs.existsSync(extractPath) === false)
                await fsp.mkdir(extractPath);
        }
    }

    else if (zipfile.containsMod === true)
    {
        extractPath = getDominionsModsPath(gameType);

        // Dom6 stores every mod in their own mod folder inside of the general mods folder.
        // Check for this folder's existence with the same name as the .dm file, and create it if it doesn't exist.
        if (gameType === config.dom6GameTypeName) {
            extractPath = path.resolve(extractPath, path.parse(zipfile.keyFileName).name);

            if (fs.existsSync(extractPath) === false)
                await fsp.mkdir(extractPath);
        }
    }

    if (extractPath == null) {
        throw new Error(`No path to extract files could be determined. Does the zipfile contain any map or mod files?`);
    }

    return extractPath;
}


function _validateZipfile(zipfile) {
    if (asserter.isString(zipfile.keyFileName) === false) {
        throw new NoKeyFileInZipError();
    }

    if (zipfile.keyFileName.split("/").length > 1) {
        throw new NestedKeyFileError();
    }

    if (zipfile.keyFileContainsWhitespace === true) {
        throw new KeyFileContainsWhitespaceError();
    }
}


async function _extractZipfile(zipfile, extractPath) {
    if (zipfile.containsMap === true) {
        await zipfile.extractTo(extractPath, _filterMapEntry);
        log.upload(log.getNormalLevel(), `Map entries written successfully.`);
    }

    else if (zipfile.containsMod === true) {
        await zipfile.extractTo(extractPath, _filterModEntry);
        log.upload(log.getNormalLevel(), `Mod entries written successfully.`);
    }
}


function _filterMapEntry(entry, extractPath) {
    log.upload(log.getNormalLevel(), `Checking entry ${entry.fileName}...`);

    // .map files that begin with two underscores __ don't get found
    // properly by the --mapfile flag, so make sure to remove them here
    if (/^_+/g.test(entry.fileName) === true)
    {
        log.upload(log.getNormalLevel(), `Data file ${entry.fileName} contains underscores at the beginning of its name, removing them.`);
        entry.fileName = entry.fileName.replace(/^_+/g, "");
    }


    if (fs.existsSync(`${extractPath}/${entry.fileName}`) === true)
        log.upload(log.getNormalLevel(), `File ${entry.fileName} already exists; skipping.`);

    // Directories finish their name in /, keep these as well to preserve mod structure
    else if (/\/$/.test(entry.fileName) === true)
    {
        log.upload(log.getNormalLevel(), `Keeping directory ${entry.fileName}.`);
        return true;
    }

    // Select only the relevant files to extract (directories are included
    // so that a mod's structure can be preserved properly)
    else if (ALLOWED_MAP_EXTENSIONS.includes(path.extname(entry.fileName)) === true)
    {
        log.upload(log.getNormalLevel(), `Keeping data file ${entry.fileName}.`);
        return true;
    }

    else log.upload(log.getNormalLevel(), `Skipping file ${entry.fileName}.`);
}


function _filterModEntry(entry, extractPath) {
    log.upload(log.getNormalLevel(), `Checking entry ${entry.fileName}...`);

    if (fs.existsSync(`${extractPath}/${entry.fileName}`) === true)
        log.upload(log.getNormalLevel(), `File ${entry.fileName} already exists; skipping.`);

    // Directories finish their name in /, keep these as well to preserve mod structure
    else if (/\/$/.test(entry.fileName) === true)
    {
        log.upload(log.getNormalLevel(), `Keeping directory ${entry.fileName}.`);
        return true;
    }

    // Select only the relevant files to extract (directories are included
    // so that a mod's structure can be preserved properly)
    else if (ALLOWED_MOD_EXTENSIONS.includes(path.extname(entry.fileName)) === true)
    {
        log.upload(log.getNormalLevel(), `Keeping data file ${entry.fileName}.`);
        return true;
    }

    else log.upload(log.getNormalLevel(), `Skipping file ${entry.fileName}.`);
}


//We're not using a callback because if the execution fails, we'll just print it
//to the bot log; the user doesn't need to know about it.
function _cleanupTmpFiles(filepath)
{
    log.upload(log.getNormalLevel(), `Deleting temp zipfile "${filepath}"...`);

    if (fs.existsSync(`${filepath}.zip`) === false && fs.existsSync(filepath) === false)
    {
        log.upload(log.getNormalLevel(), `Temp zipfile "${filepath}" did not exist.`);
        return Promise.resolve();
    }

    else if (fs.existsSync(`${filepath}.zip`) === true && fs.existsSync(filepath) === false)
    {
        filepath = `${filepath}.zip`;
    }

    return fsp.unlink(filepath)
    .then(() => log.upload(log.getNormalLevel(), `Temp zipfile "${filepath}" was successfully deleted.`))
    .catch((err) => log.error(log.getNormalLevel(), `FAILED TO DELETE TMP ZIPFILE "${filepath}"`, err));
}
