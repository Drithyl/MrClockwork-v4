
const assert = require("../../asserter.js");
const MessageWrapper = require("../wrappers/message_wrapper.js");
const MessageEmbedBuilder = require("../wrappers/message_embed_builder.js");

const MAX_MESSAGE_CHARACTERS = 2000;

module.exports = MessagePayload;

function MessagePayload(header, content = "", splitContent = true, splitWrapper = "")
{
    assert.isStringOrThrow(header);
    assert.isStringOrThrow(content);

    const _header = header;
    const _payloadObject = {};
    const _attachments = [];
    const _splitContent = splitContent;
    var _content = content;
    var _contentArray = [];

    _ensureContentIsUnderMaxLimit();


    this.addContent = (content) =>
    {
        if (assert.isString(content) === true)
        {
            _content += content;
            _splitContent();
        }
    };

    this.setEmbed = (embed) =>
    {
        if (assert.isInstanceOfPrototype(embed, MessageEmbedBuilder) === true)
            _payloadObject.embeds = [ embed.toEmbedStruct() ]

        else if (embedStruct != null)
            _payloadObject.embeds = [ embed ];

        return this;
    };

    this.setAttachment = (filename, buffer) =>
    {
        _attachments.push({ name: filename, attachment: buffer });

        if (_areAttachmentsTooLarge(_attachments) === true)
            throw new Error(`Cannot send attachments as they are above 8MB in size.`);

        return this;
    };

    this.setAttachments = (filenames, buffers) =>
    {
        filenames.forEach((filename, i) => this.setAttachment(filename, buffers[i]));
    }

    this.send = async (target, options = {}) =>
    {
        var sentMessage;

        await _contentArray.forEachPromise(async (contentChunk, i, nextPromise) =>
        {
            var payload = (i === 0) ? Object.assign(_payloadObject, { content: contentChunk }) : { content: contentChunk };

            if (options.ephemeral === true)
                payload.ephemeral = true;

            // Only one single message can be senta as a reply to a command interaction;
            // after that it will be resolved and further messages will have to be sent normally
            // fetchReply option is needed to receive the bot's sent message as a return value
            if (assert.isFunction(target.isCommandInteraction) === true)
            {
                var resolvedMessage = await target.reply(Object.assign(payload, { fetchReply: true }));

                // If this is the first message sent, store it as our sent message to pin it
                // later if needed; only the first message should be pinned
                if (i === 0)
                    sentMessage = resolvedMessage;
            }

            else if (assert.isFunction(target.send) === true)
            {
                var resolvedMessage = await target.send(payload);

                // If this is the first message sent, store it as our sent message to pin it
                // later if needed; only the first message should be pinned
                if (i === 0)
                    sentMessage = resolvedMessage;
            }

            else throw new Error(`Invalid target for message payload.`);

            return nextPromise();
        });

        if (sentMessage != null && options.pin === true && assert.isFunction(sentMessage.pin) === true)
            sentMessage.pin();


        await _attachments.forEachPromise(async (attachment, i, nextPromise) => 
        {
            await target.send({files: [ attachment ]});
            return nextPromise();
        });

        return new MessageWrapper(sentMessage);
    };

    
    // Takes care of splitting the content in proper chunks if they are too large
    function _ensureContentIsUnderMaxLimit()
    {
        _contentArray = [];

        // If the total length of the header and content is less than the max allowed,
        // then add them together to be sent in a single message
        if (_header.length + _content.length < MAX_MESSAGE_CHARACTERS)
            _contentArray.push(_header + _content);

        // If the length is more than allowed and split content is true,
        // we will split the content payload into several substrings
        else if (_splitContent === true)
        {
            // Split by newlines first so we don't cut off sentences in the middle
            const lines = _content.split(/\n/g);

            // Account for the wrap characters' length
            const maxCombinedLength = MAX_MESSAGE_CHARACTERS - (splitWrapper.length*2);

            // Add the header to the start of our lines, splitting it as well
            // if it turns out to be larger than the max characters by itself
            if (_header.length >= maxCombinedLength)
                lines.unshift(..._header.split(/\n/g));

            else lines.unshift(_header);

            // If the content is one single big line of over the allowed length, 
            // then split it by chunks of at most the allowed length
            if (/\S+/i.test(_content) === true && lines.length === 1)
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
            _contentArray.push(_header);
            _attachments.push({ name: "content.txt", attachment: Buffer.from(_content, "utf8") });
        }
    }
}



function _areAttachmentsTooLarge(files)
{
    for (var i = 0; i < files.length; i++)
    {
        const sizeInMB = files[i].attachment.length * 0.000001;
        if (sizeInMB > 8)
            return true;
    }

    return false;
}