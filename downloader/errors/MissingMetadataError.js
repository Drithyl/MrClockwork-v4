const { CustomError } = require('../../errors/custom_errors');

module.exports = class MissingMetadataError extends CustomError {
	constructor() {
		super(`No metadata exists for this file; you must call fetchMetadata() before calling downloadFile()`);
	}
};
