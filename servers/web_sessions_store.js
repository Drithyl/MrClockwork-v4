

const _sessions = {};

module.exports.addSession = (userId, token, data) =>
{
    _sessions[userId] = {token, data: data};
};

module.exports.doesSessionExist = (userId, token) =>
{
    return _sessions[userId] != null && _sessions[userId].token === token;
};

module.exports.removeSession = (userId) =>
{
    delete _sessions[userId];
};

module.exports.getSessionData = (userId) =>
{
    return _sessions[userId].data;  
};