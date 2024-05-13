const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const es = require("event-stream");
const logger = require("../logger");
const { performance } = require("perf_hooks");

const ASSET_TAGS = require("../json/dom6_modding_asset_tags.json");

/**
 * Reads a mod's directory in search of multiple .dm files that may exist.
 * Then parses each .dm file and analyzes which asset paths are required.
 * It will then "dissect" the whole directory by copying the individual
 * .dm files and only the assets that each of them need into its own folder.
 * @param {String} readModDirPath - the path where the mod folder to read is
 * @param {String} targetBaseModsDir - the dir where the dissected modfiles get written
 */
module.exports = async function dissectMod(readModDirPath, targetBaseModsDir) {

    const start = performance.now();
    const modFiles = await fsp.readdir(readModDirPath);
    const dmFiles = modFiles.filter((f) => path.extname(f) === ".dm");
    const results = [];

    for (const filename of dmFiles) {
        const resultData = {
            modfile: filename,
            totalFiles: 1,
            installedFiles: [],
            skippedFiles: []
        };

        const dmFilepath = path.resolve(readModDirPath, filename);
        const { version, relAssetPaths } = await parseDom6Modfile(dmFilepath, ASSET_TAGS);

        resultData.totalFiles += relAssetPaths.length;
        logger.upload(logger.getLeanLevel(), `Unique asset tags found for mod ${filename}: ${relAssetPaths.length}\n`);
        
        // Trim any versioning that users might have added to the mod's .dm file, so as to
        // append our own without it being redundant. The regexp will catch most formats, such as:
        // AI_Auto_Divine_Blessing_v0.1
        // BalancedArena1.1
        // bozmod_dom6_0.1
        // CommunityMemesv1.01
        // EA_Omniscience_v1_00
        // LucidsThematicGemGenV20
        const newModTrimmedFilename = path.parse(filename).name.replace(/_?v?\d+(\.|_)?\d*$/i, "");

        const newModDirName = `${newModTrimmedFilename}-clockwork_v${version}`;
        const newModDirPath = path.resolve(targetBaseModsDir, newModDirName);

        const newModfileName = `${newModDirName}.dm`;
        const newModfilePath = path.join(newModDirPath, newModfileName);

        if (fs.existsSync(newModDirPath) === false) {
            await fsp.mkdir(newModDirPath, { recursive: true });
        }

        if (fs.existsSync(newModfilePath) === false) {
            await copyFile(dmFilepath, newModfilePath);
            resultData.installedFiles.push(newModfileName);
        }
        else {
            resultData.skippedFiles.push(newModfileName);
        }

        for (const relAssetPath of relAssetPaths) {
            const originalAsset = path.resolve(readModDirPath, relAssetPath);
            const newAssetFilePath = path.join(newModDirPath, relAssetPath);
            const newAssetDirPath = path.dirname(newAssetFilePath);

            if (fs.existsSync(newAssetDirPath) === false) {
                await fsp.mkdir(newAssetDirPath, { recursive: true });
            }

            if (fs.existsSync(newAssetFilePath) === false) {
                await copyFile(originalAsset, newAssetFilePath);
                resultData.installedFiles.push(relAssetPath);
            }
            else {
                resultData.skippedFiles.push(relAssetPath);
            }
        }

        results.push(resultData);
    }

    const end = performance.now();
    logger.upload(logger.getLeanLevel(), `Finished dissecting submods. Total time taken: ${(end - start).toFixed(2)}ms.`);
    return results;
};

async function parseDom6Modfile(dmFilepath, listOfAssetTagsToFind) {
    const relAssetPathSet = new Set();
    const returnData = {
        version: null,
        relAssetPaths: [],
        absAssetPaths: []
    };

    await parseFileByLines(dmFilepath, (modLine) => {
        // Process line here and call stream.resume() when ready for next line
        for (const tag of listOfAssetTagsToFind) {
            // Add a space after the tag in the RegExp to avoid matching
            // mod tags that resemble our tags, such as #springpower,
            // which can give a false positive when looking for #spr tags
            const versionRegex = /#version\s+(\d\.\d{1,2})/;
            const assetPathRegex = new RegExp(`^${tag}\\s+"(.+\\.\\w+)"`);

            if (modLine[0] !== "#") {
                continue;
            }

            const versionMatch = versionRegex.exec(modLine);

            // If we match a version tag, get the capture group at index 1 to extract the version
            if (versionMatch != null) {
                returnData.version = versionMatch[1];
                continue;
            }

            const assetPathMatch = assetPathRegex.exec(modLine);

            // If we match an asset tag, get the capture group at index 1 to extract the filepath
            if (assetPathMatch != null) {
                relAssetPathSet.add(assetPathMatch[1]);
            }
        }
    });

    const setArray = Array.from(relAssetPathSet);
    returnData.relAssetPaths = setArray;
    returnData.absAssetPaths = setArray.map((p) => path.resolve(path.dirname(dmFilepath), p));
    return returnData;
}

function parseFileByLines(filepath, lineProcessingFunction) {
    
    // Start measuring amount of ms to parse the whole file
    const start = performance.now();
    
    return new Promise((resolve, reject) => {
        // Start a read stream on file
        const stream = fs.createReadStream(filepath)
            // Use event-stream module to break up every stream chunk into a line
            .pipe(es.split())
            // Iterate through every line in the file
            .pipe(es.mapSync(async (line) => {
        
                // Pause the readstream
                stream.pause();

                // Perform processing for this line
                await lineProcessingFunction(line);
        
                // Resume the readstream to get the next line
                stream.resume();
            })
            .on("error", function(err){
                reject(err);
            })
            // Finished parsing whole file; do post-processing here
            .on("end", function(){
                const end = performance.now();
                logger.upload(logger.getLeanLevel(), `\nFinished parsing lines. Total time taken: ${(end - start).toFixed(2)}ms.`);
                resolve();
            })
        );
    });
}

async function copyFile(sourceFilePath, destFilePath) {
    const destDirPath = path.dirname(destFilePath);
    const sourceFilename = path.basename(sourceFilePath);

    try {
        await fsp.access(sourceFilePath, fs.constants.R_OK);
        await fsp.access(destDirPath, fs.constants.W_OK);
        await fsp.copyFile(sourceFilePath, destFilePath);
        logger.upload(logger.getVerboseLevel(), `Source file "${sourceFilename}" copied successfully.`);
    }
    catch (error) {
        if (error.errno === -2) {
            logger.error(logger.getLeanLevel(), `File "${sourceFilePath}" doesn't exist.`);
        }

        else if (error.errno === -13) {
            logger.error(logger.getLeanLevel(), `Could not access "${path.resolve(destFilePath)}"`);
        }

        else {
            logger.error(logger.getLeanLevel(), `Could not copy "${sourceFilePath}" to "${destFilePath}"`, error);
        }
    }
}
