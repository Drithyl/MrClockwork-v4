
//TODO: redo entirely?

/*const rw = require("../reader_writer.js");
const uploadHistory = require("./history.js");
const slaveLoader = require("../slaves/loader.js");
const messenger = require("../discord/messenger.js");
const uploadToSlave = require("./upload_to_slave.js");*/

exports.uploadFileToServer = (googleDriveLink, serverName) =>
{

};

module.exports.start = function(gameType, action, fileId, channel, user)
{
  console.log(`Starting file ${fileId} ${gameType} ${action} upload for ${user.username}...`);
  let slavesResponded = [];

  if (slaveLoader.getLength() < 1)
  {
    console.log(`No servers are online. Cannot upload.`);
    return messenger.send(channel, `No servers are currently online. The file cannot be uploaded at this time.`);
  }

  return slaveLoader.forEachAsync((slave, i, next) =>
  {
    return uploadToSlave.start(slave, gameType, action, fileId, channel, user)
    .then((response) =>
    {
      console.log(`Upload to server ${slave.name} complete.`);
      return next();
    })
    .catch((err) =>
    {
      rw.log(["upload", "error"], `Upload to ${slave.name} failed to resolve promise:\n\n${err.stack}`);
      next();
    });
    //finish function
  })
  .then(() =>
  {
    console.log(`Finished uploading file ${fileId} ${gameType} ${action}.`);
    uploadHistory.addUpload(user, action);
    return Promise.resolve();
  });
};
