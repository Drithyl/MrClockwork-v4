"use strict";
module.exports = UserWrapper;
function UserWrapper(discordJsUserObject) {
    var _discordJsUserObject = discordJsUserObject;
    this.getId = function () { return _discordJsUserObject.id; };
    this.getUsername = function () { return _discordJsUserObject.username; };
}
//# sourceMappingURL=user_wrapper.js.map