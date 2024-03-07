const { CustomError } = require('../../errors/custom_errors');

module.exports = class Dom6MapButDom5UploadError extends CustomError {
	constructor() {
		super("This zipfile contains a Dominions 6 map, but it is being uploaded as a Dominions 5 map");
	}
};
