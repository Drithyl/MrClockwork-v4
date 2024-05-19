module.exports.underline = function(string) {
    return `__${string.toString()}__`;
};

module.exports.bold = function(string) {
    return `**${string.toString()}**`;
};

module.exports.dateToUnixTimestamp = function(dateObject) {
    const ms = dateObject.getTime();
    return parseInt(ms / 1000).toFixed(0);
};

module.exports.unixTimestampToDynamicDisplay = function(timestamp) {
    return `<t:${timestamp}:F>`;
};
