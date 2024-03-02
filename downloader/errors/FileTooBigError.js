const { CustomError } = require('../../errors/custom_errors');

module.exports = class FileTooBigError extends CustomError {
	constructor(fileSizeInBytes) {
		super(`Expected file to be of ${fileSizeInBytes * 0.000001} MB or less in size`);
	}
};
