
const assert = require("../asserter.js");
const rw = require("../reader_writer.js");
const MessageWrapper = require("./wrappers/message_wrapper.js");

module.exports.send = function(receiver, text, options = {})
{
  let optionsObject = _createMessageOptionsObject(options);

  return new Promise((resolve, reject) =>
  {
    if (optionsObject.files == null && (text == null || text === ""))
    {
      return reject(new Error("Cannot send an empty message."));
    }

    try
    {
      receiver.send(text, optionsObject)
      .then((discordJsMessage) => 
      {
        if (optionsObject.pin === true)
          return discordJsMessage.pin();
        
        else return resolve(discordJsMessage);
      })
      .then((discordJsMessage) => resolve(new MessageWrapper(discordJsMessage)))
      .catch((err) => reject(new Error(`Could not send message:\n\n${err.stack}`)));
    }

    catch (err)
    {
      reject(err);
    }
  });
};

function _createMessageOptionsObject(options)
{
  var optionsObject = {};
  var wrapper = _formatWrapper(options.prepend, options.append);
  var attachment = _formatAttachment(options.fileBuffer, options.filename);

  if (wrapper != null)
    Object.assign(optionsObject, wrapper);

  //The pin() function will *not* be available in the returned discordjs message object
  //after using the send() function if the split option was used, since it can't pin
  //multiple messages
  else if (options.pin === true)
    optionsObject.pin = true;

  if (attachment != null)
    Object.assign(optionsObject, attachment);

  return optionsObject;
}

//Same as send, but will also log the error
module.exports.sendError = function(receiver, errorText)
{
  rw.log("error", errorText);
  return module.exports.send(receiver, errorText);
};

function _formatWrapper(prepend, append)
{
  var wrapperObject = { split: { prepend: "", append: "" } };

  if (prepend == null && append == null)
    return null;

  if (assert.isString(prepend) === true)
    wrapperObject.split.prepend = prepend;

  if (assert.isString(append) === true)
    wrapperObject.split.append = append;

  return wrapperObject;
}

function _formatAttachment(files, filenames)
{
  let attachment = null;

  if (Array.isArray(files) === false && files != null)
  {
    attachment = {files: [{attachment: files}]};

    if (filenames == null)
    {
      attachment.files[0].name = "attachment";
    }

    //since files is not an array but a single file, then filenames is a single name too
    else attachment.files[0].name = filenames;
  }

  else if (files != null)
  {
    attachment = {files: []};

    files.forEach((file, i) =>
    {
      if (filenames[i] == null)
      {
        attachment.files.push({attachment: file, name: "attachment"});
      }

      else attachment.files.push({attachment: file, name: filenames[i]});
    });
  }

  return attachment;
}
