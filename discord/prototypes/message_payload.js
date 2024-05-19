
const assert = require("../../asserter.js");
const MessageWrapper = require("../wrappers/message_wrapper.js");
const MessageEmbedBuilder = require("../wrappers/message_embed_builder.js");
const { EmbedBuilder } = require("@discordjs/builders");

const MAX_MESSAGE_CHARACTERS = 2000;

module.exports = MessagePayload;

function MessagePayload(header = "", content = "", splitContent = true, splitWrapper = "")
{
    assert.isStringOrThrow(header);
    assert.isStringOrThrow(content);

    let _header = header;
    let _content = content;
    let _contentArray = [];
    const _payloadObject = {};
    const _attachments = [];
    const _splitContent = splitContent;

    _ensureContentIsUnderMaxLimit();

    this.setHeader = (header) =>
    {
        if (assert.isString(header) === true)
        {
            _header = header;
            _ensureContentIsUnderMaxLimit();
        }
        return this;
    };

    this.prependToHeader = (text) => {
        this.setHeader(`${text}${_header}`);
        return this;
    };

    this.addContent = (content) =>
    {
        if (assert.isString(content) === true)
        {
            _content += content;
            _ensureContentIsUnderMaxLimit();
        }
        return this;
    };

    this.addEmbeds = (embeds) =>
    {
        if (Array.isArray(embeds) === false) {
            embeds = [embeds];
        }

        for (const embed of embeds) {
            assert.isInstanceOfPrototypeOrThrow(embed, EmbedBuilder);
        }

        _payloadObject.embeds = embeds;
        return this;
    };

    this.setEmbed = (embed) =>
    {
        if (assert.isInstanceOfPrototype(embed, MessageEmbedBuilder) === true)
            _payloadObject.embeds = [ embed.toEmbedStruct() ];

        else if (embed != null)
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
    };

    this.send = async (target, options = {}) =>
    {
        let sentMessage;

        await _contentArray.forEachPromise(async (contentChunk, i, nextPromise) =>
        {
            let payload = (i === 0) ? Object.assign(_payloadObject, { content: contentChunk }) : { content: contentChunk };

            if (options.ephemeral === true)
                payload.ephemeral = true;

            // Only one single message can be sent as a reply to a command interaction;
            // after that it will be resolved and further messages will have to be sent normally
            // fetchReply option is needed to receive the bot's sent message as a return value
            if (target.isCommandInteraction === true)
            {
                let resolvedMessage = await target.reply(Object.assign(payload, { fetchReply: true }));

                // If this is the first message sent, store it as our sent message to pin it
                // later if needed; only the first message should be pinned
                if (i === 0)
                    sentMessage = resolvedMessage;
            }

            else if (assert.isFunction(target.send) === true)
            {
                let resolvedMessage = await target.send(payload);

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
        if (_header.length + _content.length < MAX_MESSAGE_CHARACTERS) {
            if (_content == null || _content.length === 0) {
                _contentArray.push(splitWrapper + _header + splitWrapper);
            }
            else _contentArray.push(_header + splitWrapper + _content + splitWrapper);
        }

        // If split content is true, we will split the content payload into several substrings
        else if (_splitContent === true)
        {
            // Split by newlines first so we don't cut off sentences in the middle
            const lines = _content.split(/\n/g);
            const headerLines = [];

            // Account for the wrap characters' length
            const maxCombinedLength = MAX_MESSAGE_CHARACTERS - (splitWrapper.length*2);

            // Add the header to the start of our lines, splitting it as well
            // if it turns out to be larger than the max characters by itself
            if (_header.length >= maxCombinedLength)
                headerLines.push(..._header.split(/\n/g));

            else headerLines.push(_header);

            // If the content is one single big line of over the allowed length, 
            // then split it by chunks of at most the allowed length
            if (/\S+/i.test(_content) === true && lines.length === 1)
                _contentArray = lines[0].match(new RegExp(`[\\s\\S]{1,${maxCombinedLength}}`, "g"));

            // Otherwise, recompile all the lines into several submessages of at most the allowed length each
            else lines.forEach((line) =>
            {
                let lastIndex = (_contentArray.length-1 < 0) ? 0 : _contentArray.length-1;

                if (_contentArray.length < 1)
                    _contentArray.push(`${line}\n`);

                // If adding the new line to this submessage would push it above max length, make a new submessage
                else if (_contentArray[lastIndex].length + line.length > maxCombinedLength)
                    _contentArray.push(`${line}\n`);

                // Otherwise, attach it to the current submessage
                else _contentArray[lastIndex] += `${line}\n`;
            });

            // Add the wrapping characters in-between each submessage
            _contentArray = _contentArray.map((contentChunk) =>
            {
                return `${splitWrapper}${contentChunk}${splitWrapper}`;
            });

            // Add header to content after having split the content itself
            _contentArray.unshift(...headerLines.filter((l) => l != null && l !== ''));
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
    for (let i = 0; i < files.length; i++)
    {
        const sizeInMB = files[i].attachment.length * 0.000001;
        if (sizeInMB > 8)
            return true;
    }

    return false;
}
