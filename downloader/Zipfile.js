
const fs = require("fs");
const path = require("path");
const unzip = require("./yauzl/yauzl.js");
const safePath = require("./safe_path.js");
const asserter = require("../asserter.js");
const TooManyEntriesError = require("./errors/TooManyEntriesError.js");

module.exports = class Zipfile {
    constructor(zipfilePath) {
        const resolvedPath = safePath(zipfilePath);

        if (fs.existsSync(resolvedPath) === false) {
            throw new Error(`No zipfile exists at path "${resolvedPath}"`);
        }

        this.zipfilePath = resolvedPath;
        this.name = path.basename(resolvedPath);
    }

    setMaxEntries(maxEntries) {
        this.maxEntries = maxEntries;
    }

    async exploreZip() {
        const whitespaceRegex = /\s/g;
        this.zipfile = await unzip.openZipfile(this.zipfilePath);

        try {
            if (asserter.isNumber(this.maxEntries) === true && this.zipfile.entryCount > this.maxEntries) {
                throw new TooManyEntriesError(this.maxEntries, this.zipfile.entryCount);
            }
    
            await unzip.walkZipfile(this.zipfile, (entry, i, breakOutOfLoopFn) =>
            {
                if (path.extname(entry.fileName) === ".d6m") {
                    this.containsDom6Map = true;
                    this.containsMap = true;
                    this.keyFileName = entry.fileName;

                    if (whitespaceRegex.test(entry.fileName) === true) {
                        this.keyFileContainsWhitespace = true;
                    }

                    breakOutOfLoopFn();
                }

                else if (path.extname(entry.fileName) === ".map") {
                    this.containsMap = true;
                    this.keyFileName = entry.fileName;

                    if (whitespaceRegex.test(entry.fileName) === true) {
                        this.keyFileContainsWhitespace = true;
                    }

                    breakOutOfLoopFn();
                }

                else if (path.extname(entry.fileName) === ".dm") {
                    this.containsMod = true;
                    this.keyFileName = entry.fileName;

                    if (whitespaceRegex.test(entry.fileName) === true) {
                        this.keyFileContainsWhitespace = true;
                    }

                    breakOutOfLoopFn();
                }
            });
        }
        catch(error) {
            this.ensureZipfileGetsClosed();
            throw error;
        }
    }

    async extractTo(extractPath, filterFn) {
        this.ensureZipfileGetsClosed();
        await unzip.extractTo(this.zipfilePath, extractPath, (entry) => filterFn(entry, extractPath));
        this.ensureZipfileGetsClosed();
    }

    ensureZipfileGetsClosed() {
        if (this.zipfile != null && this.zipfile.isOpen === true) {
            this.zipfile.close();
        }
    }
};
