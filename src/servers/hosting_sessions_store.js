

const _sessions = {};

module.exports.addSession = (userId, token, gameObject) =>
{
    _sessions[userId] = {token, game: gameObject};
};

module.exports.doesSessionExist = (userId, token) =>
{
    return _sessions[userId] != null && _sessions[userId].token === token;
};

module.exports.removeSession = (userId) =>
{
    delete _sessions[userId];
};

module.exports.getSessionGameObject = (userId) =>
{
    return _sessions[userId].game;  
};