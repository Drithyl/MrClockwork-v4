const { CustomError } = require('../../errors/custom_errors');

module.exports = class TooManyEntriesError extends CustomError {
	constructor(maxEntries, entriesGiven) {
		super(`Expected zipfile with ${maxEntries} files or less. Instead got ${entriesGiven} files`);
	}
};
