

const fs = require("fs");
const log = require("../../logger.js");
const assert = require("../../asserter.js");
const { google } = require('googleapis');

module.exports = DownloadStream;

function DownloadStream(oAuth2Object, downloadPath)
{
    const drive = google.drive({ version:"v3", oAuth2Object });
    const writeStream = fs.createWriteStream(downloadPath);

    let onDownloadErrorHandler;

    let onReadErrorHandler;
    let onReadEndHandler;
    let onReadCloseHandler;
    let onReadDataHandler;
    
    let onWriteErrorHandler;
    let onWriteFinishHandler;
    let onWriteCloseHandler;

    this.onDownloadError = (handler) => onDownloadErrorHandler = handler;

    this.onReadError = (handler) => onReadErrorHandler = handler;
    this.onReadEnd = (handler) => onReadEndHandler = handler;
    this.onReadClose = (handler) => onReadCloseHandler = handler;
    this.onReadData = (handler) => onReadDataHandler = handler;
    
    this.onWriteError = (handler) => onWriteErrorHandler = handler;
    this.onWriteFinish = (handler) => onWriteFinishHandler = handler;
    this.onWriteClose = (handler) => onWriteCloseHandler = handler;

    this.startDownload = (getOptions, responseTypeOptions) =>
    {
        drive.files.get(getOptions, responseTypeOptions, (err, response) =>
        {
            let readStream;

            /*err.response has the following fields:
                {
                    "status": 404,
                    "statusText": "Not Found",
                    "data": "Not Found"
                }
            */
            if (err)
                return onDownloadErrorHandler(new Error(`Download error: ${err.response.status} - ${err.response.statusText}`));

            readStream = response.data;

            //add ReadStream handlers
                readStream.on('error', (err) => onReadErrorHandler(err));
                readStream.on('end', () => onReadEndHandler());
                readStream.on("close", () => onReadCloseHandler());

            if (assert.isFunction(onReadDataHandler) === true)
                readStream.on("data", (chunk) => onReadDataHandler(Buffer.byteLength(chunk)));
            
            //make sure the dest Writable is safe to write (i.e. no error occurred)
            if (writeStream.writable === false)
                return onWriteError(new Error(`Write stream is not in a writable state.`));


            log.upload(log.getVerboseLevel(), "WriteStream is writable. Piping ReadStream into it.");

            //pipe response readable stream into our writestream. This returns the
            //writestream object so we can chain writestream event handlers into it
            readStream.pipe(writeStream)
            .on("error", (err) => onWriteErrorHandler(err))
            .on("finish", () => onWriteFinishHandler())
            .on("close", () => onWriteCloseHandler());
        });
    };
}