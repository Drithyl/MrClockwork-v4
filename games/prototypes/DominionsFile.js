const fs = require("fs");
const path = require("path");
const log = require("../../logger.js");
const { isString } = require("../../asserter.js");
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

        console.log(`${this.filename} - parsing next tag...`);

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
            console.log(`\tParsed tag: "${this.tag}"`);
        }

        else throw new Error(`Parsing tag failed in line: "${this.string}"`);

        if (assetPathMatch != null && assetPathMatch[1] != null) {
            this.asset = path.join(assetPathMatch[1]);
            console.log(`\tParsed asset path: "${this.asset}"`);
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
    constructor(filePath) {
        super(filePath);
        this.extraPlanes = [];
        this.isPlaneFile = /_plane\d.map$/i.test(this.name);

        const filesInDir = fs.readdirSync(this.dirPath);
        
        if (this.isPlaneFile === false) {
            const relatedPlaneRegExp = new RegExp(`^${this.name}_plane\\d\\.map$`, 'i');
            const planeFiles = filesInDir.filter((filename) => {
                return relatedPlaneRegExp.test(filename) === true;
            });

            for (const filename of planeFiles) {
                const planeFilePath = path.join(this.dirPath, filename);
    
                this.extraPlanes.push(new DominionsMapFile(planeFilePath));
                this.dependencies.add(planeFilePath);
            }
        }

        const terrainTagRegExp = MAP_TERRAIN_FILE_TAGS.reduce((regexp, tag, i) => {
            if (i < MAP_TERRAIN_FILE_TAGS.length - 1) {
                return regexp += `(${tag})|`;
            }
            else return regexp += `(${tag})`;
        }, '');

        const relatedTerrainFileRegExp = new RegExp(`^${this.name}_(${terrainTagRegExp})\\.tga$`, 'i');
        const terrainFiles = filesInDir.filter((filename) => {
            return relatedTerrainFileRegExp.test(filename) === true;
        });

        for (const filename of terrainFiles) {
            const terrainFilePath = path.join(this.dirPath, filename);
            this.dependencies.add(terrainFilePath);
        }
    }

    async parseDependencies() {
        const mapFiles = [...this.extraPlanes];

        // A plane file will already be part of the list through the main file
        if (this.isPlaneFile === false) {
            mapFiles.push(this);
        }

        for (const mapFile of mapFiles) {
            await parseFileByLines(mapFile.path, (line) => this.processLine(line));
        }

        return this.dependencies;
    }
}

class DominionsModFile extends DominionsMetadataFile {
    constructor(filePath) {
        super(filePath);
    }

    async parseDependencies() {
        await parseFileByLines(this.path, (line) => this.processLine(line));
        return this.dependencies;
    }
}

module.exports.DominionsMapFile = DominionsMapFile;
module.exports.DominionsModFile = DominionsModFile;