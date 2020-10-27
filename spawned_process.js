
const assert = require("./asserter.js");
const spawn = require('child_process').spawn;

module.exports = SpawnedProcess;

function SpawnedProcess(exePath, args)
{
    assert.isStringOrThrow(exePath);
    assert.isValidPathOrThrow(exePath);
    assert.isArrayOrThrow(args);

    const _process = spawn(exePath, args);
    _process.stderr.setEncoding("utf8");
    _process.stdout.setEncoding("utf8");

    this.onError = (doThis) => _process.on("error", (error) => doThis(error));
    
    this.onExited = (doThis) => _process.on("exit", (code, signal) => 
    {
        if (signal == null)
            doThis(code);
    });

    this.onTerminated = (doThis) => _process.on("exit", (code, signal) => 
    {
        if (code == null)
            doThis(signal);
    });

    this.onStdioExited = (doThis) => _process.on("close", (code, signal) =>
    {
        if (signal == null)
            doThis(code);
    });

    this.onStdioTerminated = (doThis) => _process.on("close", (code, signal) =>
    {
        if (code == null)
            doThis(signal);
    });

    this.onStderrData = (doThis) => _process.stderr.on("data", (data) => doThis(data));
    this.onStderrError = (doThis) => _process.stderr.on("error", (error) => doThis(error));

    this.onStdoutData = (doThis) => _process.stdout.on("data", (data) => doThis(data));
    this.onStdoutError = (doThis) => _process.stdout.on("error", (error) => doThis(error));
}