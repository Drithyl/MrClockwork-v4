const { CustomError } = require('../../errors/custom_errors');

module.exports = class KeyFileContainsWhitespaceError extends CustomError {
	constructor() {
		super("One or more of the key files (.map, .d6m, .dm, etc.) contain spaces in their name. This can cause issues");
	}
};
