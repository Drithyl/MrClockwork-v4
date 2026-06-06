const path = require("path");

module.exports.renameMod = function (dmFilePath, dominionsModFile) {
    const parsedPath = path.parse(dmFilePath);
    const dmDirPath = parsedPath.dir;
    const dmFilename = parsedPath.name;
    const parsedFilename = parseVersionFromFilename(dmFilename);
    let newFilename = `${parsedFilename.filename}-clockwork`;

    if (dominionsModFile.version != null) {
        newFilename += `_v${dominionsModFile.version}`;
    }

    else if (parsedFilename.version != null) {
        newFilename += `_v${parsedFilename.version}`;
    }

    // Go up one dir level to replace old dir name with new one (dir and filename have to match)
    const newDirPath = path.join(dmDirPath, "../", newFilename);
    const newFilePath = path.join(newDirPath, newFilename + parsedPath.ext);
    return newFilePath;
}

function parseVersionFromFilename(dmFilename) {
    const versionMatch = dmFilename.match(/(_|-)?(v|V)\d+(\.|_)?\d*$/i);
    const result = {};

    if (versionMatch != null) {
        const version = versionMatch[0].replace(/^_?(v|V)?/, "");
        const filename = dmFilename.replace(versionMatch[0], "");
        return { filename, version };
    }

    else {
        return { filename : dmFilename };
    }
}
