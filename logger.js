const fs = require("fs");
const path = require("path");
const assert = require("./asserter.js");
const config = require("./config/config.json");

const BASE_LOG_PATH = `${config.dataPath}/${config.logsFolder}`;

const LEAN_LEVEL = 0;
const NORMAL_LEVEL = 1;
const VERBOSE_LEVEL = 2;

var currentLogLevel = config.defaultLogLevel;
var isLoggingToFile = true;


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

module.exports.isLoggingToFile = () => isLoggingToFile;
module.exports.toggleLogToFile = () =>
{
    isLoggingToFile = !isLoggingToFile;
    exports.general(LEAN_LEVEL, `isLoggingToFile set to ${isLoggingToFile}.`);
    return isLoggingToFile;
};


module.exports.general = (logLevel, header, ...data) =>
{
    var logStr = _log(logLevel, header, ...data);
    _logToFile(logStr, "general.txt");
};

module.exports.command = (logLevel, commandContext) =>
{
    if (logLevel > currentLogLevel)
        return;

    const username = commandContext.getCommandSenderUsername();
    const command = commandContext.getCommandString();
    const channel = commandContext.getDestinationChannel();
    const args = commandContext.getCommandArgumentsArray();
    const guild = (commandContext.wasSentByDm() === false) ? commandContext.getGuildWrapper() : null;
    var logStr = `${username} invoked <${command}> `;

    if (guild != null)
        logStr += `in channel ${channel.name} from guild "${guild.getName()}"`;

    else logStr += `by DM`;

    logStr += ` with args [${args.join(", ")}]`;

    var logStr = _log(logLevel, logStr);
    _logToFile(logStr, "general.txt");
};

module.exports.error = (logLevel, header, ...data) =>
{
    var logStr = _log(logLevel, header, ...data);
    _logToFile(logStr, "error.txt");
};

module.exports.upload = (logLevel, header, ...data) =>
{
    var logStr = _log(logLevel, header, ...data);
    _logToFile(logStr, "upload.txt");
};


function _log(logLevel, header, ...data)
{
    var logStr = `${_getTimestamp()}\t${header}\n`;

    data.forEach((line) =>
    {
        if (assert.isObject(line) === true)
            logStr += "\n" + _indentJSON(line);

        else logStr += `\n\t${line}`;
    });

    logStr += "\n";

    if (logLevel <= currentLogLevel)
        console.log(logStr);

    return logStr;
}

function _logToFile(logStr, filename)
{
    if (isLoggingToFile === false)
        return;

    const date = new Date();
    const logPath = path.resolve(BASE_LOG_PATH, `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}-${filename}`);
    fs.createWriteStream(logPath, { flags: "a" }).write(logStr);
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