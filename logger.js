
const fs = require("fs");
const path = require("path");
const stream = require("stream");
const assert = require("./asserter.js");
const config = require("./config/config.json");

const BASE_LOG_PATH = path.resolve(config.dataPath, "logs");

const LEAN_LEVEL = 0;
const NORMAL_LEVEL = 1;
const VERBOSE_LEVEL = 2;

let currentLogLevel = config.defaultLogLevel;
let isLoggingToFile = true;

let dayOfMonth = new Date().getDate();
let generalWriteStream;
let errorWriteStream;
let uploadWriteStream;

_updateStreamPaths();

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
    let logStr = _log(logLevel, header, ...data);
    _logToFile(logStr, generalWriteStream);
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
    let logStr = `${username} invoked <${command}> `;

    if (guild != null)
        logStr += `in channel ${channel.name} from guild "${guild.getName()}"`;

    else logStr += `by DM`;

    logStr += ` with args [${args.join(", ")}]`;

    logStr = _log(logLevel, logStr);
    _logToFile(logStr, generalWriteStream);
};

module.exports.error = (logLevel, header, ...data) =>
{
    let logStr = _log(logLevel, header, ...data);
    _logToFile(logStr, errorWriteStream);
};

module.exports.upload = (logLevel, header, ...data) =>
{
    let logStr = _log(logLevel, header, ...data);
    _logToFile(logStr, uploadWriteStream);
};

const timers = {};

module.exports.time = (tag, display) =>
{
    timers[tag] = {
        start: Date.now(),
        display: display ?? tag
    };
};

module.exports.timeEnd = (tag, logLevel) =>
{
    logLevel = logLevel ?? NORMAL_LEVEL;
    const data = timers[tag];
    delete timers[tag];

    if (data == null)
        return;

    const timeTaken = (Date.now() - data.start) * 0.001;
    module.exports.general(logLevel, `${data.display}: ${timeTaken.toFixed(3)}s`);
};


function _log(logLevel, header, ...data)
{
    let logStr = `${_getTimestamp()}\t${header}\n`;

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

function _logToFile(logStr, writeStream)
{
    if (isLoggingToFile === false)
        return;

    _updateStreamPaths();
    writeStream.write(logStr);
}

function _updateStreamPaths()
{
    const date = new Date();
    const day = date.getDate();

    if (dayOfMonth === day && 
        assert.isInstanceOfPrototype(generalWriteStream, stream.Writable) === true && 
        assert.isInstanceOfPrototype(errorWriteStream, stream.Writable) === true && 
        assert.isInstanceOfPrototype(uploadWriteStream, stream.Writable) === true)
        return;

    dayOfMonth = day;

    if (generalWriteStream != null && generalWriteStream.destroyed === false)
        generalWriteStream.destroy();

    if (errorWriteStream != null && errorWriteStream.destroyed === false)
        errorWriteStream.destroy();

    if (uploadWriteStream != null && uploadWriteStream.destroyed === false)
        uploadWriteStream.destroy();

    generalWriteStream = fs.createWriteStream(_getLogPath(date, "general.txt"), { flags: "a", autoClose: true });
    errorWriteStream = fs.createWriteStream(_getLogPath(date, "error.txt"), { flags: "a", autoClose: true });
    uploadWriteStream = fs.createWriteStream(_getLogPath(date, "upload.txt"), { flags: "a", autoClose: true });
}

function _getLogPath(date, filename)
{
    return path.resolve(BASE_LOG_PATH, `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}-${filename}`);
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