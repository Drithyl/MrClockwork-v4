"use strict";
var assert = require("./asserter.js");
var spawn = require('child_process').spawn;
module.exports = SpawnedProcess;
function SpawnedProcess(exePath, args) {
    assert.isStringOrThrow(exePath);
    assert.isArrayOrThrow(args);
    assert.isValidPathOrThrow(exePath);
    var _process = spawn(exePath, args);
    _process.stderr.setEncoding("utf8");
    _process.stdout.setEncoding("utf8");
    _process.stdio.setEncoding("utf8");
    _process.stdin.setEncoding("utf8");
    this.onError = function (doThis) { return _process.on("error", function (error) { return doThis(error); }); };
    this.onExited = function (doThis) {
        return _process.on("exit", function (code, signal) {
            if (signal == null)
                doThis(code);
        });
    };
    this.onTerminated = function (doThis) {
        return _process.on("exit", function (code, signal) {
            if (code == null)
                doThis(signal);
        });
    };
    this.onStdioExited = function (doThis) {
        return _process.on("close", function (code, signal) {
            if (signal == null)
                doThis(code);
        });
    };
    this.onStdioTerminated = function (doThis) {
        return _process.on("close", function (code, signal) {
            if (code == null)
                doThis(signal);
        });
    };
    this.onStderrData = function (doThis) { return _process.stderr.on("data", function (data) { return doThis(data); }); };
    this.onStderrError = function (doThis) { return _process.stderr.on("error", function (error) { return doThis(error); }); };
    this.onStdoutData = function (doThis) { return _process.stdout.on("data", function (data) { return doThis(data); }); };
    this.onStdoutError = function (doThis) { return _process.stdout.on("error", function (error) { return doThis(error); }); };
    this.onStdioData = function (doThis) { return _process.stdio.on("data", function (data) { return doThis(data); }); };
    this.onStdioError = function (doThis) { return _process.stdio.on("error", function (error) { return doThis(error); }); };
    this.onStdinData = function (doThis) { return _process.stdin.on("data", function (data) { return doThis(data); }); };
    this.onStdinError = function (doThis) { return _process.stdin.on("error", function (error) { return doThis(error); }); };
}
//# sourceMappingURL=spawned_process.js.map