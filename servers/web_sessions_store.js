
const url = require("url");
const uuidv4 = require("uuid").v4;

const _sessions = {};

module.exports.createSession = (userId) =>
{
    const token = uuidv4();
    _sessions[token] = {userId, token};
    return token;
};

module.exports.storeData = (token, data) =>
{
    if (_sessions[token] == null)
        throw new Error(`User session with token ${token} does not exist.`);

    _sessions[token].data = data;
};

module.exports.storeResult = (token, result) =>
{
    if (_sessions[token] == null)
        throw new Error(`User session with token ${token} does not exist.`);

    _sessions[token].result = result;
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

module.exports.getSessionResult = (token) =>
{
    if (_sessions[token] == null)
        return null;
        
    return _sessions[token].result;  
};

module.exports.redirectToResult = (expressRes, token, resultMessage) =>
{
    if (_sessions[token] == null)
        throw new Error(`User session with token ${token} does not exist.`);

    exports.storeResult(token, resultMessage);
    expressRes.redirect("/result?token=" + sessionToken);
    return Promise.resolve();
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