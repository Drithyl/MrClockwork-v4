const path = require("path");
const log = require("../../logger.js");
const spawn = require("child_process").spawn;
const config = require("../../config/config.json");
const STEAMCMD_PATH = config.pathToSteamcmd;
const TIMEOUT_IN_MS = 60000;

module.exports = class SteamCMD {

    static runCommand(args) {
        let commandLog = "";
        const steamcmdExePath = path.resolve(STEAMCMD_PATH, "steamcmd.exe");
        const instance = spawn(steamcmdExePath, args);

        log.general(log.getLeanLevel(), "Running steamcmd command with args:", args);

        // Set encoding of pipes to utf8
        instance.stdout.setEncoding("utf8");
        instance.stderr.setEncoding("utf8");

        // Promisify the command so it resolves/rejects when it's done running
        return Promise((resolve, reject) => {
            let wasPromiseResolved = false;
    
            // Add a timeout to kill steamcmd if it gets stuck
            setTimeout(() => {
                if (wasPromiseResolved === false) {
                    wasPromiseResolved = true;
                    reject(new Error(`steamcmd ${(instance.pid || '')} - steamcmd took too long to download item`), commandLog);
                }
    
                if (instance.killed === false) {
                    instance.kill();
                }
    
            }, TIMEOUT_IN_MS);
        
            
            instance.on("spawn", () => {
                log.general(log.getLeanLevel(), `Spawned steamcmd process with pid ${instance.pid}`);
            });
        
            // Most data will come through this pipe
            instance.stdout.on("data", (data) => {
                commandLog += data;
                log.general(log.getLeanLevel(), `steamcmd (${instance.pid}) - stdout: ${data}`);
            });
            
            instance.stderr.on("data", (data) => {
                commandLog += data;
                log.general(log.getLeanLevel(), `steamcmd (${instance.pid}) - stderr: ${data}`);
            });
            
            instance.on("error", (error) => 
            {
                if (wasPromiseResolved === false) {
                    wasPromiseResolved = true;
                    log.error(log.getLeanLevel(), `steamcmd (${instance.pid}) - error:`, error);
                    reject(error);
                }
    
                if (instance.killed === false) {
                    instance.kill();
                }
            });
    
            instance.on("exit", (code, signal) => 
            {
                if (code === 0) {
                    log.general(log.getLeanLevel(), `steamcmd (${instance.pid}) exited gracefully`);
                }
            
                else {
                    log.general(log.getLeanLevel(), `steamcmd (${instance.pid}) exited with code ${code} and signal ${signal}`);
                }
    
                if (wasPromiseResolved === false) {
                    wasPromiseResolved = true;
                    resolve(commandLog);
                }
            });
            
            instance.on("close", (code, signal) => 
            {
                if (code === 0) {
                    log.general(log.getLeanLevel(), `steamcmd (${instance.pid}) closed gracefully`);
                }
            
                else {
                    log.general(log.getLeanLevel(), `steamcmd (${instance.pid}) closed with code ${code} and signal ${signal}`);
                }
            });
        });
    }
};
