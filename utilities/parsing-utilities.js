const { isString } = require("../asserter");

module.exports.parseDiscordId = function(mention)  {
    if (isString(mention)) {
        const regex = /^<@(\d+)>$/;
        const matches = mention.match(regex);

        if (matches != null && matches.length >= 1) {
            return matches[1];
        }
    }

    return null;
};
