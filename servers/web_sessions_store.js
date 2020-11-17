
const url = require("url");
const uuidv4 = require("uuid").v4;

const _sessions = {};

module.exports.createSession = (userId, data) =>
{
    const token = uuidv4();
    _sessions[token] = {userId, data, token};
    return token;
};

module.exports.doesSessionExist = (token) =>
{
    return _sessions[token] != null && _sessions[token].token === token;
};

module.exports.removeSession = (token) =>
{
    delete _sessions[token];
};

module.exports.getSessionUserId = (token) =>
{
    if (_sessions[token] == null)
        return null;

    return _sessions[token].userId;  
};

module.exports.getSessionData = (token) =>
{
    if (_sessions[token] == null)
        return null;
        
    return _sessions[token].data;  
};

module.exports.extractSessionParamsFromUrl = (reqUrl) =>
{
    const urlObject = url.parse(reqUrl, true);
    const token = urlObject.query.token;
    const userId = exports.getSessionUserId(token);

    return { userId, token };
};

module.exports.isSessionValid = (authenticationParams) =>
{
    const token = authenticationParams.token;
    return exports.doesSessionExist(token);
};