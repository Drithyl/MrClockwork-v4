const asserter = require("../../asserter.js");
const FileTooBigError = require("../errors/FileTooBigError.js");
const MissingMetadataError = require("../errors/MissingMetadataError.js");
const WrongFileExtensionError = require("../errors/WrongFileExtensionError.js");
const safePath = require("../safe_path.js");
const googleDriveAPI = require("./index.js");

module.exports = class GoogleDriveFile {
    constructor(googleDriveId) {
        this.googleDriveId = googleDriveId;
    }

    static extractGoogleDriveFileId(linkOrId)
    {
        const linkRegExp = new RegExp("^(https?:\\/\\/)?(drive.google.com)?(/file/d/)?(/drive/folders/)?(/open\\?id=)?([a-z0-9\\-_]+)(\\/?\\??.+)?", "i");
    
        if (asserter.isString(linkOrId) === false)
            return;
    
        linkOrId = linkOrId.trim();
    
        if (linkRegExp.test(linkOrId) === true)
            return linkOrId.replace(linkRegExp, "$6");
    }

    setMaxFileSize(fileSizeInMB) {
        this.maxFileSizeInBytes = fileSizeInMB * 2000000;
    }

    async authorizeGoogleDriveAPI() {
        await googleDriveAPI.authorize();
        this.googleDrive = googleDriveAPI;
    }

    async fetchMetadata() {
        this.metadata = await this.googleDrive.fetchFileMetadata(this.googleDriveId);
    }

    async downloadFile(downloadPath) {
        this.validateMetadata();
        await this.googleDrive.downloadFile(this.googleDriveId, safePath(downloadPath));
    }

    validateMetadata() {
        if (this.metadata == null) {
            throw new MissingMetadataError(`No metadata exists for this file; you must call fetchMetadata() before calling downloadFile()`);
        }

        //The fileExtension property does not include the "." at the beginning of it
        if (this.metadata.fileExtension !== 'zip') {
            throw new WrongFileExtensionError(this.metadata.fileExtension);
        }

        if (asserter.isNumber(this.maxFileSizeInBytes) === true && this.metadata.size > this.maxFileSizeInBytes) {
            throw new FileTooBigError(this.maxFileSizeInBytes);
        }
    }
};
