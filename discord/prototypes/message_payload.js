
const assert = require("../../asserter.js");

const MAX_MESSAGE_CHARACTERS = 2000;

module.exports = MessagePayload;

function MessagePayload(header, content = "", splitContent = false, splitWrapper = "")
{
    assert.isStringOrThrow(header);
    assert.isStringOrThrow(content);

    const _header = header;
    const _content = content;
    const _payloadObject = {};
    const _splitContent = splitContent;
    var _contentArray = [];

    // If the total length of the header and content is less than the max allowed,
    // then add them together to be sent in a single message
    if (_header.length + _content.length < MAX_MESSAGE_CHARACTERS)
        _contentArray.push(header + content);

    // If the length is more than allowed and split content is true,
    // we will split the content payload into several substrings
    else if (_splitContent === true)
    {
        // Split by newlines first so we don't cut off sentences in the middle
        const lines = content.split(/\n/g);

        // Account for the header (will be added to the first content string) length and the wrap characters' length
        const maxCombinedLength = MAX_MESSAGE_CHARACTERS - _header.length - (splitWrapper.length*2);

        // If the content is one single big line of over the allowed length, 
        // then split it by chunks of at most the allowed length
        if (lines.length === 1)
            _contentArray = lines[0].match(new RegExp(`[\\s\\S]{1,${maxCombinedLength}}`, "g"));

        // Otherwise, recompile all the lines into several submessages of at most the allowed length each
        else lines.forEach((line) =>
        {
            var lastIndex = (_contentArray.length-1 < 0) ? 0 : _contentArray.length-1;

            if (_contentArray.length < 1)
                _contentArray.push(`${line}\n`);

            // If adding the new line to this submessage would push it above max length, make a new submessage
            else if (_contentArray[lastIndex].length + line.length > maxCombinedLength)
                _contentArray.push(`${line}\n`);

            // Otherwise, attach it to the current submessage
            else _contentArray[lastIndex] += `${line}\n`;
        });

        // Add the wrapping characters in-between each submessage
        _contentArray = _contentArray.map((contentChunk, i, arr) =>
        {
            if (i > 0) contentChunk = `${splitWrapper}${contentChunk}`;
            if (i < arr.length - 1) contentChunk = `${contentChunk}${splitWrapper}`;
            return contentChunk;
        });
    }

    // If the length is more than allowed but splitContent is false,
    // then turn the content into an attached text file instead
    else
    {
        _payloadObject.content = _header;
        _payloadObject.files = [{ name: "content.txt", attachment: Buffer.from(_content, "utf8") }];
    }


    this.setEmbed = (embedStruct) =>
    {
        if (embedStruct != null)
            _payloadObject.embeds = [ embedStruct ];
    };

    this.setAttachment = (filename, buffer) =>
    {
        if (_payloadObject.files == null)
            _payloadObject.files = [];

        _payloadObject.files.push({ name: filename, attachment: buffer });

        if (_areAttachmentsTooLarge(_payloadObject.files) === true)
            throw new Error(`Cannot send attachments as they are above 8MB in size.`);
    };

    this.send = async (target, options = {}) =>
    {
        var sentMessage;

        _contentArray.forEach(async (contentChunk, i) =>
        {
            var payload = (i === 0) ? Object.assign(_payloadObject, { content: _header + contentChunk }) : { content: contentChunk };

            if (options.ephemeral === true)
                payload.ephemeral = true;

            if (assert.isFunction(target.isCommandInteraction) === true && i === 0)
                sentMessage = await target.reply(payload);

            else if (assert.isFunction(target.send) === true)
                sentMessage =  await target.send(payload);

            else throw new Error(`Invalid target for message payload.`);
        });

        if (options.pin === true && assert.isFunction(sentMessage.pin) === true)
            await sentMessage.pin();
    };

}


function _areAttachmentsTooLarge(files)
{
    totalSize = files.reduce((total, file) => 
    {
        const sizeInMB = file.attachment.length * 0.000001;
        return total + sizeInMB;
    }, 0);
        
    return totalSize > 8;
}