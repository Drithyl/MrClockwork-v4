const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const logger = require("../logger");
const { performance } = require("perf_hooks");
const { DominionsModFile } = require("../games/prototypes/DominionsFile");

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
        const dominionsModFile = new DominionsModFile(dmFilepath);
        const dependencies = await dominionsModFile.loadDependencies();

        resultData.totalFiles += dependencies.size;
        logger.upload(logger.getLeanLevel(), `Found ${dependencies.size} dependencies for ${filename}\n`);
        
        // Trim any versioning that users might have added to the mod's .dm file, so as to
        // append our own without it being redundant. The regexp will catch most formats, such as:
        // AI_Auto_Divine_Blessing_v0.1
        // BalancedArena1.1
        // bozmod_dom6_0.1
        // CommunityMemesv1.01
        // EA_Omniscience_v1_00
        // LucidsThematicGemGenV20
        const newModTrimmedFilename = path.parse(filename).name.replace(/_?v?\d+(\.|_)?\d*$/i, "");

        const newModDirName = `${newModTrimmedFilename}-clockwork_v${dominionsModFile.version}`;
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

        for (const absoluteAssetPath of Array.from(dependencies)) {
            const relativeAssetPath = path.relative(dominionsModFile.dirPath, absoluteAssetPath);
            const newAssetFilePath = path.join(newModDirPath, relativeAssetPath);
            const newAssetDirPath = path.dirname(newAssetFilePath);

            if (fs.existsSync(newAssetDirPath) === false) {
                await fsp.mkdir(newAssetDirPath, { recursive: true });
            }

            if (fs.existsSync(newAssetFilePath) === false) {
                await copyFile(absoluteAssetPath, newAssetFilePath);
                resultData.installedFiles.push(relativeAssetPath);
            }
            else {
                resultData.skippedFiles.push(relativeAssetPath);
            }
        }

        results.push(resultData);
    }

    const end = performance.now();
    logger.upload(logger.getLeanLevel(), `Finished dissecting submods. Total time taken: ${(end - start).toFixed(2)}ms.`);
    return results;
};

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
