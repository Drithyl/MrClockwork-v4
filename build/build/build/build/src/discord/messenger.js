"use strict";
var assert = require("../asserter.js");
var rw = require("../reader_writer.js");
var MessageWrapper = require("./wrappers/message_wrapper.js");
module.exports.send = function (receiver, text, options) {
    if (options === void 0) {
        options = {};
    }
    var optionsObject = _createMessageOptionsObject(options);
    return new Promise(function (resolve, reject) {
        if (optionsObject.files == null && (text == null || text === "")) {
            return reject(new Error("Cannot send an empty message."));
        }
        try {
            receiver.send(text, optionsObject)
                .then(function (discordJsMessage) {
                if (optionsObject.pin === true)
                    return discordJsMessage.pin();
                else
                    return resolve(discordJsMessage);
            })
                .then(function (discordJsMessage) { return resolve(new MessageWrapper(discordJsMessage)); })
                .catch(function (err) { return reject(new Error("Could not send message:\n\n" + err.stack)); });
        }
        catch (err) {
            reject(err);
        }
    });
};
function _createMessageOptionsObject(options) {
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
module.exports.sendError = function (receiver, errorText) {
    rw.log("error", errorText);
    return module.exports.send(receiver, errorText);
};
function _formatWrapper(prepend, append) {
    var wrapperObject = { split: { prepend: "", append: "" } };
    if (prepend == null && append == null)
        return null;
    if (assert.isString(prepend) === true)
        wrapperObject.split.prepend = prepend;
    if (assert.isString(append) === true)
        wrapperObject.split.append = append;
    return wrapperObject;
}
function _formatAttachment(files, filenames) {
    var attachment = null;
    if (Array.isArray(files) === false && files != null) {
        attachment = { files: [{ attachment: files }] };
        if (filenames == null) {
            attachment.files[0].name = "attachment";
        }
        //since files is not an array but a single file, then filenames is a single name too
        else
            attachment.files[0].name = filenames;
    }
    else if (files != null) {
        attachment = { files: [] };
        files.forEach(function (file, i) {
            if (filenames[i] == null) {
                attachment.files.push({ attachment: file, name: "attachment" });
            }
            else
                attachment.files.push({ attachment: file, name: filenames[i] });
        });
    }
    return attachment;
}
//# sourceMappingURL=messenger.js.map