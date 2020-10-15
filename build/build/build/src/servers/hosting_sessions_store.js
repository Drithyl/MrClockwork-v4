"use strict";
var _sessions = {};
module.exports.addSession = function (userId, token, gameObject) {
    _sessions[userId] = { token: token, game: gameObject };
};
module.exports.doesSessionExist = function (userId, token) {
    return _sessions[userId] != null && _sessions[userId].token === token;
};
module.exports.removeSession = function (userId) {
    delete _sessions[userId];
};
module.exports.getSessionGameObject = function (userId) {
    return _sessions[userId].game;
};
//# sourceMappingURL=hosting_sessions_store.js.map