const path = require("path");

module.exports.renameMod = function (dominionsModFile) {
    const dmFilename = dominionsModFile.filename;
    const filenameVersionInfo = parseVersionFromFilename(dmFilename);
    const parsedRenamedFilename = path.parse(filenameVersionInfo.filename);
    let newFilename = `${parsedRenamedFilename.name}-clockwork`;

    if (dominionsModFile.version != null) {
        newFilename += `_v${dominionsModFile.version}`;
    }

    else if (filenameVersionInfo.version != null) {
        newFilename += `_v${filenameVersionInfo.version}`;
    }

    newFilename += parsedRenamedFilename.ext;
    return newFilename;
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
