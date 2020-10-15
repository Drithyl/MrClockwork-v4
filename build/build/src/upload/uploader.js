"use strict";
//TODO: redo entirely?
/*const rw = require("../reader_writer.js");
const uploadHistory = require("./history.js");
const slaveLoader = require("../slaves/loader.js");
const messenger = require("../discord/messenger.js");
const uploadToSlave = require("./upload_to_slave.js");*/
exports.uploadFileToServer = function (googleDriveLink, serverName) {
};
module.exports.start = function (gameType, action, fileId, channel, user) {
    console.log("Starting file " + fileId + " " + gameType + " " + action + " upload for " + user.username + "...");
    var slavesResponded = [];
    if (slaveLoader.getLength() < 1) {
        console.log("No servers are online. Cannot upload.");
        return messenger.send(channel, "No servers are currently online. The file cannot be uploaded at this time.");
    }
    return slaveLoader.forEachAsync(function (slave, i, next) {
        return uploadToSlave.start(slave, gameType, action, fileId, channel, user)
            .then(function (response) {
            console.log("Upload to server " + slave.name + " complete.");
            return next();
        })
            .catch(function (err) {
            rw.log(["upload", "error"], "Upload to " + slave.name + " failed to resolve promise:\n\n" + err.stack);
            next();
        });
        //finish function
    })
        .then(function () {
        console.log("Finished uploading file " + fileId + " " + gameType + " " + action + ".");
        uploadHistory.addUpload(user, action);
        return Promise.resolve();
    });
};
//# sourceMappingURL=uploader.js.map