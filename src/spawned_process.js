
const assert = require("./asserter.js");
const spawn = require('child_process').spawn;

module.exports = SpawnedProcess;

function SpawnedProcess(exePath, args)
{
    assert.isStringOrThrow(exePath);
    assert.isArrayOrThrow(args);
    assert.isValidPathOrThrow(exePath);

    const _process = spawn(exePath, args);
    _process.stderr.setEncoding("utf8");
    _process.stdout.setEncoding("utf8");
    _process.stdio.setEncoding("utf8");
    _process.stdin.setEncoding("utf8");

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

    this.onStdioData = (doThis) => _process.stdio.on("data", (data) => doThis(data));
    this.onStdioError = (doThis) => _process.stdio.on("error", (error) => doThis(error));

    this.onStdinData = (doThis) => _process.stdin.on("data", (data) => doThis(data));
    this.onStdinError = (doThis) => _process.stdin.on("error", (error) => doThis(error));
}