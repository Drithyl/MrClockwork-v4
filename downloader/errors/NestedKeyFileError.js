const { CustomError } = require('../../errors/custom_errors');

module.exports = class NestedKeyFileError extends CustomError {
	constructor() {
		super("The key file (.map, .d6m, or .dm) cannot be nested inside a folder! Zip your mod/map up without any containing folders!");
	}
};
