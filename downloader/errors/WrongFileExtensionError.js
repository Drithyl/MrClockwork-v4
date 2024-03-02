const { CustomError } = require('../../errors/custom_errors');

module.exports = class WrongFileExtensionError extends CustomError {
	constructor(fileExtension) {
		super(`Expected the file extension to be .zip; instead got .${fileExtension}`);
	}
};
