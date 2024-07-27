const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const log = require("../../logger.js");
const { isString, isDom6GameType } = require("../../asserter.js");
const { parseFileByLines } = require("../../utilities/file-utilities.js");

const MAP_TERRAIN_FILE_TAGS = require("../../json/dom6_map_terrain_file_tags.json");
const COMMAND_TAG_CAPTURE_REGEXP = new RegExp(/(#\w+)(\s+\w*)?/);
const ASSET_PATH_CAPTURE_REGEXP = new RegExp(/#\w+\s+"?(.+\.\w+)"?/);


class DominionsFile {
    constructor(filePath) {
        if (fs.existsSync(filePath) === false) {
            throw new Error(`Dominions file at path "${filePath}" does not exist`);
        }

        this.path = filePath;
        this.name = path.parse(filePath).name;
        this.filename = path.basename(filePath);
        this.extension = path.extname(filePath);
        this.dirPath = path.dirname(filePath);
    }
}

class DominionsMetadataFile extends DominionsFile {
    constructor(filePath) {
        super(filePath);
        this.version = '';
        this.dependencies = new Set();
    }

    processLine(line) {
        if (DominionsCommand.isDominionsCommand(line) === false) {
            return;
        }

        //console.log(`${this.filename} - parsing next tag...`);

        try {
            const command = new DominionsCommand(line);
    
            if (command.tag === "#version") {
                const versionMatch = /#version\s+(\d\.?\d*)/.exec(command.string);
    
                if (versionMatch != null && versionMatch[1] != null){
                    this.version = versionMatch[1];
                }
    
                else {
                    log.general(log.getLeanLevel(), `#version tag for ${this.filename} could not be parsed: "${command.string}"`);
                }
            }
    
            else if (command.isAssetTag() === true) {
                const assetPath = path.join(this.dirPath, command.asset);
    
                if (fs.existsSync(assetPath) === true) {
                    this.dependencies.add(assetPath);
                }
            }
        }

        catch(error) {
            throw new Error(`${this.filename} - failed parsing line "${line}" with the following error: ${error.message}`);
        }
    }
}

class DominionsCommand {
    constructor(parsedData) {
        this.string = parsedData.trim();

        const commandTagMatch = COMMAND_TAG_CAPTURE_REGEXP.exec(this.string);
        const assetPathMatch = ASSET_PATH_CAPTURE_REGEXP.exec(this.string);

        if (commandTagMatch != null && commandTagMatch[1] != null) {
            this.tag = commandTagMatch[1];
        }

        else throw new Error(`Parsing tag failed in line: "${this.string}"`);

        if (assetPathMatch != null && assetPathMatch[1] != null) {
            this.asset = path.join(assetPathMatch[1]);
        }
    }

    static isDominionsCommand(parsedLine) {
        if (isString(parsedLine) === false) {
            return false;
        }

        const commandTagMatch = COMMAND_TAG_CAPTURE_REGEXP.exec(parsedLine.trim());
        return commandTagMatch != null && commandTagMatch[1] != null;
    }

    isAssetTag() {
        return this.asset != null;
    }
}

class DominionsMapFile extends DominionsMetadataFile {
    constructor(filePath, gameType) {
        super(filePath);
        this.gameType = gameType;
        this.extraPlanes = [];
    }

    async loadDependencies() {
        await this.loadPlaneFileDependencies();
        await this.loadTerrainFileDependencies();
        await parseFileByLines(this.path, (line) => this.processLine(line));
        return this.dependencies;
    }

    async loadPlaneFileDependencies() {
        const filesInDir = await fsp.readdir(this.dirPath);
        
        if (isDom6GameType(this.gameType) === true) {
            const relatedPlaneRegExp = new RegExp(`^${this.name}_plane\\d\\.map$`, 'i');
            const planeFiles = filesInDir.filter((filename) => {
                return relatedPlaneRegExp.test(filename) === true;
            });

            for (const filename of planeFiles) {
                const planeFilePath = path.join(this.dirPath, filename);
                const planeFile = new DominionsPlaneFile(planeFilePath, this.gameType);
                await planeFile.loadDependencies();
    
                this.extraPlanes.push(planeFile);

                // Add this file and its dependencies to the set of all dependencies
                [planeFile.path, ...Array.from(planeFile.dependencies)].forEach(d => this.dependencies.add(d));
            }
        }
    }

    async loadTerrainFileDependencies() {
        const filesInDir = await fsp.readdir(this.dirPath);

        const terrainTagRegExp = MAP_TERRAIN_FILE_TAGS.reduce((regexp, tag, i) => {
            if (i < MAP_TERRAIN_FILE_TAGS.length - 1) {
                return regexp += `(${tag})|`;
            }
            else return regexp += `(${tag})`;
        }, '');

        const relatedTerrainFileRegExp = new RegExp(`^${this.name}_(${terrainTagRegExp})\\.(tga|png|d6m)$`, 'i');
        const terrainFiles = filesInDir.filter((filename) => {
            return relatedTerrainFileRegExp.test(filename) === true;
        });

        for (const filename of terrainFiles) {
            const terrainFilePath = path.join(this.dirPath, filename);
            this.dependencies.add(terrainFilePath);
        }
    }
}

class DominionsPlaneFile extends DominionsMapFile {
    constructor(filePath, gameType) {
        super(filePath, gameType);
    }

    async loadDependencies() {
        await this.loadTerrainFileDependencies();
        await parseFileByLines(this.path, (line) => this.processLine(line));
    }
}

class DominionsModFile extends DominionsMetadataFile {
    constructor(filePath) {
        super(filePath);
    }

    async loadDependencies() {
        await parseFileByLines(this.path, (line) => this.processLine(line));
        return this.dependencies;
    }
}

module.exports.DominionsMapFile = DominionsMapFile;
module.exports.DominionsModFile = DominionsModFile;
