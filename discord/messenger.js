
const log = require("../logger.js");
const assert = require("../asserter.js");
const MessageWrapper = require("./wrappers/message_wrapper.js");

module.exports.send = function(receiver, text, options = {})
{
    const optionsObject = _createMessageOptionsObject(options);
    const filesData = _analyzeFiles(optionsObject.files);

    if (optionsObject.files == null && (text == null || text === ""))
        return Promise.reject(new Error("Cannot send an empty message."));

    if (filesData.hasFileTooLarge === true)
        return Promise.reject(`File is too large for Discord.`);

    return Promise.resolve()
    .then(() =>
    {
        if (filesData.isTotalSizeTooLarge === true)
            return _sendMessageAndAttachmentsSeparately(receiver, text, optionsObject);

        else return receiver.send(text, optionsObject);
    })
    .then((discordJsMessage) => 
    {
        if (optionsObject.pin === true)
            return discordJsMessage.pin();
        
        else return Promise.resolve(discordJsMessage);
    })
    .then((discordJsMessage) => Promise.resolve(new MessageWrapper(discordJsMessage)))
    .catch((err) => 
    {
        log.error(log.getNormalLevel(), `COULD NOT DELIVER MESSAGE`, err)
        Promise.reject(new Error(`Could not deliver message: ${err.message}`));
    });
};

function _createMessageOptionsObject(options)
{
    var optionsObject = {};
    var embed = _formatEmbed(options.embed);
    var wrapper = _formatWrapper(options.prepend, options.append);
    var attachment = _formatAttachment(options.files);

    if (embed != null)
        Object.assign(optionsObject, embed);

    if (wrapper != null && embed == null)
        Object.assign(optionsObject, wrapper);

    //The pin() function will *not* be available in the returned discordjs message object
    //after using the send() function if the split option was used; it can't pin multiple messages
    else if (options.pin === true)
        optionsObject.pin = true;

    if (attachment != null)
        Object.assign(optionsObject, attachment);

    return optionsObject;
}

function _analyzeFiles(files)
{
    var totalSize;
    var result = {
        hasFileTooLarge: false,
        isTotalSizeTooLarge: false
    };

    if (Array.isArray(files) === false)
        return result;

    totalSize = files.reduce((total, file) => 
    {
        const sizeInMB = file.attachment.length * 0.000001;

        if (sizeInMB > 8)
            result.hasFileTooLarge = true;
            
        return total + sizeInMB;
    }, 0);
        
    if (totalSize > 8)
        result.isTotalSizeTooLarge = true;

    return result;
}

function _sendMessageAndAttachmentsSeparately(receiver, text, options)
{
    return receiver.send(text, { split: options.split })
    .then((discordJsMessage) => 
    {
        return options.files.forEachPromise((file, index, nextPromise) => 
        {
            return receiver.send({ files: [file] })
            .then(() => nextPromise());
        })
        .then(() => Promise.resolve(discordJsMessage));
    });
}

function _formatEmbed(embedStruct)
{
    if (embedStruct == null)
        return null;

    return { embed: embedStruct };
}

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

function _formatAttachment(files)
{
    let attachment = null;

    if (Array.isArray(files) === false && files != null)
    {
        attachment = {
            files: [{
                attachment: files.attachment, name: files.filename
            }]
        };
    }

    /** Files must be an array of objects that include the format 
     * {attachment: Buffer, name: string} */
    else if (files != null)
        attachment = { files };

    return attachment;
}
