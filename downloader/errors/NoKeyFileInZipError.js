const { CustomError } = require('../../errors/custom_errors');

module.exports = class NoKeyFileInZipError extends CustomError {
	constructor() {
		super("No relevant file found inside the zipfile. Does it contain any .map, .d6m, or .dm files?");
	}
};
