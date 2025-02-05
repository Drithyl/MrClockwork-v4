/**
 * Executes a function only after there have been no further calls to it
 * in a number of milliseconds expressed by the timeout arg.
 * 
 * Usage: debouncePreceding(() => myFunction(), 500);
 * 
 * @param {*} fnToCall 
 * @param {*} timeout 
 * @returns
 */
module.exports.debouncePreceding = function(fnToCall, timeout = 300) {
    let timer;

    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { fnToCall.apply(this, args); }, timeout);
    };
};

/**
 * Executes a function immediately, and blocks execution of subsequent
 * calls to it for a number of milliseconds expressed by the timeout arg.
 * 
 * Usage: debounceSubsequent(() => myFunction(), 500);
 * 
 * @param {*} fnToCall 
 * @param {*} timeout 
 * @returns
 */
module.exports.debounceSubsequent = function(fnToCall, timeout = 300) {
    let timer;

    return (...args) => {
        if (!timer) {
            fnToCall.apply(this, args);
        }

        clearTimeout(timer);
        timer = setTimeout(() => { timer = undefined; }, timeout);
    };
};
