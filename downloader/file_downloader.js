
const fs = require("fs");
const path = require("path");
const fsp = require("fs").promises;
const log = require("../logger.js");
const unzip = require("./yauzl/yauzl.js");
const config = require("../config/config.json");
const googleDriveAPI = require("./google_drive_api/index.js");
const { getDominionsMapsPath, getDominionsModsPath } = require("../helper_functions.js");

//These are the extensions expected in the collection of map files
const MAP_EXT_REGEXP = /(\.map)|(\.rgb)|(\.tga)|(\.png)|(\.d6m)$/i;

//These are the extensions expected in the collection of mod files
const MOD_EXT_REGEXP = /(\.dm)|(\.rgb)|(\.tga)|(\.png)|(\.sw)|(\.wav)$/i;

const ZIP_EXTENSION = "zip";
const MAX_ZIP_SIZE = config.maxFileSizeInMB * 2000000;  //200MB in bytes
const TMP_PATH = `${config.pathToDom5Data}/tmp`;
const TOP_LEVEL_MAX_FILES = 4;


module.exports.initialize = async () =>
{
    if (fs.existsSync(TMP_PATH) === false)
        fs.mkdirSync(TMP_PATH);

    await googleDriveAPI.authorize();
};

module.exports.downloadFileFromDrive = async (driveFileId, gameType) =>
{
    await _downloadFile(driveFileId, gameType);
};


async function _downloadFile(driveFileId, gameType)
{
    const fileDownloadPath = `${TMP_PATH}/${driveFileId}.zip`;
    const metadata = await _fetchMetadata(driveFileId);

    _validateMetadata(metadata);

    await _downloadFileFromDriveTo(driveFileId, fileDownloadPath);
    await _extractFiles(fileDownloadPath, gameType);
    await _cleanupTmpFiles(driveFileId);
}

async function _fetchMetadata(driveFileId)
{
    log.upload(log.getNormalLevel(), `Obtaining metadata of file id ${driveFileId}...`);

    //obtain the file metadata (name, extension, size) first and then check that it qualifies to be downloaded
    return await googleDriveAPI.fetchFileMetadata(driveFileId);
}

function _validateMetadata(metadata)
{
    //The fileExtension property does not include the "." at the beginning of it
    if (metadata.fileExtension !== ZIP_EXTENSION)
    {
        log.upload(log.getNormalLevel(), `Linked file is not a zipfile.`);
        throw new Error(`Only .${ZIP_EXTENSION} files are supported. Please send the file id of a .${ZIP_EXTENSION} file so it can be unzipped into the proper directory`);
    }

    if (metadata.size > MAX_ZIP_SIZE)
    {
        log.upload(log.getNormalLevel(), `Linked file has a size of ${metadata.size}, which is beyond the limit of ${MAX_ZIP_SIZE}`);
        throw new Error(`For bandwidth reasons, your file cannot be over ${MAX_ZIP_SIZE * 0.000001}MB in size. Please choose a smaller file`);
    }
}

async function _downloadFileFromDriveTo(driveFileId, fileDownloadPath)
{
    log.upload(log.getNormalLevel(), `Downloading and fetching zipfile ${driveFileId}...`);

    // Obtain the zipfile in proper form through yauzl
    await googleDriveAPI.downloadFile(driveFileId, fileDownloadPath);
}

async function _extractFiles(zipfilePath, gameType)
{
    const targetPath = await _autodetectPath(zipfilePath, gameType);
    const isMapZip = targetPath.includes("maps") === true;
    const filter = (isMapZip) ? MAP_EXT_REGEXP : MOD_EXT_REGEXP;

    await unzip.extractTo(zipfilePath, targetPath, (entry) => _filterEntry(entry, filter, targetPath));

    log.upload(log.getNormalLevel(), `Entries written successfully.`);
}

async function _autodetectPath(zipfilePath, gameType)
{
    let targetPath = null;
    let hasDirInBetweenFiles = false;
    let hasTooManyTopLevelFiles = false;

    await unzip.walkZipfile(zipfilePath, async (entry, i, closeFile) =>
    {
        let levelsDeep = (entry.fileName.match(/\//g) || []).length;

        // Directory entries end with a /; we do not count these as a level deeper
        if (entry.fileName.at(-1) === "/")
            levelsDeep--;

        // If the second entry is already one level deep, then the zipfile contains a
        // single directory with other files under it. Entries are read in the order 
        // they were added to the zipfile by the user;
        // this means it's impossible to detect how many files are at the top level
        // of the zipfile reliably without checking all entries. This makes this check
        // unfeasible, even though it would be desirable to ensure zipfiles uploaded
        // only contain as many necessary files on their top level as needed (4, 
        // for maps' .map and .tga files)
        if (i === 1 && levelsDeep > 0)
        {
            //hasDirInBetweenFiles = true;
            //closeFile();
        }

        // Entries are read in the order they were added to the zipfile by the user;
        // this means it's impossible to detect how many files are at the top level
        // of the zipfile reliably without checking all entries. This makes this check
        // unfeasible, even though it would be desirable to ensure zipfiles uploaded
        // only contain as many necessary files on their top level as needed (4, 
        // for maps' .map and .tga files)
        if (i > TOP_LEVEL_MAX_FILES && levelsDeep === 0)
        {
            //hasTooManyTopLevelFiles = true;
            //closeFile();
        }

        if (path.extname(entry.fileName) === ".map" || path.extname(entry.fileName) === ".d6m")
        {
            if (gameType === config.dom5GameTypeName && path.extname(entry.fileName) === ".map") {
                targetPath = getDominionsMapsPath(gameType);
            }

            // Dom6 stores every map in their own map folder inside of the general maps folder.
            // Check for this folder's existence with the same name as the .d6m file, and create it if it doesn't exist.
            else if (gameType === config.dom6GameTypeName) {
                targetPath = path.resolve(getDominionsMapsPath(gameType), path.parse(entry.fileName).name);

                if (fs.existsSync(targetPath) === false)
                    await fsp.mkdir(targetPath);
            }

            closeFile();
        }

        else if (path.extname(entry.fileName) === ".dm")
        {
            targetPath = getDominionsModsPath(gameType);

            // Dom6 stores every mod in their own mod folder inside of the general mods folder.
            // Check for this folder's existence with the same name as the .dm file, and create it if it doesn't exist.
            if (gameType === config.dom6GameTypeName) {
                targetPath = path.resolve(targetPath, path.parse(entry.fileName).name);

                if (fs.existsSync(targetPath) === false)
                    await fsp.mkdir(targetPath);
            }

            closeFile();
        }

        //else if (i > TOP_LEVEL_MAX_FILES && targetPath == null)
        //    closeFile();

        
        //if (i > TOP_LEVEL_MAX_FILES)
        //    closeFile();
    });
   
    if (hasDirInBetweenFiles === true)
        throw new Error("Zipfile contains a folder in-between the .zip and the compressed files. Zip up the mod or map files directly, not a folder");

    
    if (hasTooManyTopLevelFiles === true)
        throw new Error(`Zipfile contains too many top-level files. A proper mod or map should not need more than ${TOP_LEVEL_MAX_FILES} files and/or folders at the top level (i.e. the level at which the .dm or .map file is located) of its structure`);

    if (targetPath == null)
        throw new Error(`Your zipfile must contain a .dm or .map file within the first ${TOP_LEVEL_MAX_FILES} entries to autodetect whether it is a mod or a map.`);


    return targetPath;
}


/** function used to filter the entries inside the zipfile. Must return true to be extracted */
function _filterEntry(entry, extensionFilter, targetPath)
{
    log.upload(log.getNormalLevel(), `Checking entry ${entry.fileName}...`);

    //.map files that begin with two underscores __ don't get found
    //properly by the --mapfile flag, so make sure to remove them here
    if (/^_+/g.test(entry.fileName) === true)
    {
        log.upload(log.getNormalLevel(), `Data file ${entry.fileName} contains underscores at the beginning of its name, removing them.`);
        entry.fileName = entry.fileName.replace(/^_+/g, "");
    }

    if (fs.existsSync(`${targetPath}/${entry.fileName}`) === true)
        log.upload(log.getNormalLevel(), `File ${entry.fileName} already exists; skipping.`);

    //directories finish their name in /, keep these as well to preserve mod structure
    else if (/\/$/.test(entry.fileName) === true)
    {
        log.upload(log.getNormalLevel(), `Keeping directory ${entry.fileName}.`);
        return true;
    }

    //select only the relevant files to extract (directories are included
    //so that a mod's structure can be preserved properly)
    else if (extensionFilter.test(entry.fileName) === true)
    {
        log.upload(log.getNormalLevel(), `Keeping data file ${entry.fileName}.`);
        return true;
    }

    else log.upload(log.getNormalLevel(), `Skipping file ${entry.fileName}.`);
}

//We're not using a callback because if the execution fails, we'll just print it
//to the bot log; the user doesn't need to know about it.
function _cleanupTmpFiles(filename)
{
    let path = `${TMP_PATH}/${filename}`;

    log.upload(log.getNormalLevel(), `Deleting temp zipfile ${filename}...`);

    if (fs.existsSync(`${path}.zip`) === false && fs.existsSync(path) === false)
    {
        log.upload(log.getNormalLevel(), `Temp zipfile ${filename} did not exist.`);
        return Promise.resolve();
    }

    else if (fs.existsSync(`${path}.zip`) === true && fs.existsSync(path) === false)
    {
        path = `${path}.zip`;
    }

    return fsp.unlink(path)
    .then(() => log.upload(log.getNormalLevel(), `Temp zipfile ${filename} was successfully deleted.`))
    .catch((err) => log.error(log.getNormalLevel(), `FAILED TO DELETE TMP ZIPFILE ${filename}`, err));
}
