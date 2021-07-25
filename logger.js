
const assert = require("./asserter.js");
const rw = require("./reader_writer.js");
const config = require("./config/config.json");


const logsBasePath = `${config.dataPath}/${config.logsFolder}`;

const GENERAL_LOG_PATH = `${logsBasePath}/general.txt`;
const ERROR_LOG_PATH = `${logsBasePath}/error.txt`;
const UPLOAD_LOG_PATH = `${logsBasePath}/upload.txt`;

const LEAN_LEVEL = 0;
const NORMAL_LEVEL = 1;
const VERBOSE_LEVEL = 2;

var currentLogLevel = config.defaultLogLevel;
var logToFile = true;


module.exports.getLeanLevel = () => LEAN_LEVEL;
module.exports.getNormalLevel = () => NORMAL_LEVEL;
module.exports.getVerboseLevel = () => VERBOSE_LEVEL;


module.exports.getLogLevel = () => currentLogLevel;
module.exports.setLogLevel = (level) =>
{
    if (assert.isInteger(level) === false)
        return;

        currentLogLevel = level;
    exports.general(LEAN_LEVEL, `logLevel set to ${currentLogLevel}.`);
};

module.exports.isLoggingToFile = () => logToFile;
module.exports.toggleLogToFile = () =>
{
    logToFile = !logToFile;
    exports.general(LEAN_LEVEL, `logToFile set to ${logToFile}.`);
    return logToFile;
};


module.exports.general = (logLevel, header, ...data) =>
{
    if (logLevel > currentLogLevel)
        return;

    return _writeToFileAndLog(GENERAL_LOG_PATH, header, ...data);
};

module.exports.error = (logLevel, header, ...data) =>
{
    if (logLevel > currentLogLevel)
        return;

    return _writeToFileAndLog(ERROR_LOG_PATH, header, ...data);
};

module.exports.upload = (logLevel, header, ...data) =>
{
    if (logLevel > currentLogLevel)
        return;

    return _writeToFileAndLog(UPLOAD_LOG_PATH, header, ...data);
};


function _writeToFileAndLog(path, header, ...data)
{
    const logStr = _log(header, ...data);

    if (logToFile === false)
        return;

    return rw.append(path, logStr)
    .catch((err) => _log(`LOGGER ERROR: Could not log to file.`, `${err.message}\n\n${err.stack}`));
}

function _log(header, ...data)
{
    var logStr = `${_getTimestamp()}\t${header}\n`;

    data.forEach((line) =>
    {
        if (assert.isObject(line) === true)
            logStr += "\n" + _indentJSON(line);

        else logStr += `\n\t${line}`;
    });

    logStr += "\n";
    console.log(logStr);
    return logStr;
}

function _getTimestamp()
{
    return new Date(Date.now()).toISOString().replace(/^(.+)(T)/i, "$1$2 ");
}

// Stringify a json object with full indentation
function _indentJSON(obj)
{
    // Replace the normal stringification if the object is an Error,
    // otherwise they will show as empty {} objects
    const jsonStr = JSON.stringify(obj, function replacer(objKey, objValue)
    {
        const err = {};

        if (objValue instanceof Error)
        {
            Object.getOwnPropertyNames(objValue).forEach((key) => err[key] = objValue[key]);
            return err;
        }

        return objValue;

    }, 4);

    // Split the resulting JSON string by newlines and/or escaped newlines
    const split = jsonStr.split(/\n|\\n/g);

    // Rejoin them with added indentation
    return "\t" + split.join("\n\t") + "\n";
}