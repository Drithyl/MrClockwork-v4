
const url = require("url");
const WebSession = require("./prototypes/web_session.js");

const _sessions = {};

module.exports.createSession = (userId) =>
{
    const session = new WebSession(userId);
    const sessionId = session.getSessionId();

    _sessions[sessionId] = session;
    return session;
};

module.exports.getSession = (sessionId) =>
{
    return _sessions[sessionId];
};

module.exports.getSessionFromUrlParams = (req) =>
{
    const urlObject = url.parse(req.url, true);
    const sessionId = urlObject.query.sessionId;
    const session = exports.getSession(sessionId);
    return session;
};

module.exports.getSessionFromBody = (req) =>
{
    const body = req.body;
    const sessionId = body.sessionId;
    const session = exports.getSession(sessionId);
    return session;
};

module.exports.getSessionFromCookies = (req) =>
{
    const cookies = req.cookies;
    const sessionId = cookies.sessionId;
    const session = exports.getSession(sessionId);
    return session;
};

module.exports.doesSessionExist = (sessionId) =>
{
    return _sessions[sessionId] != null && _sessions[sessionId].getSessionId() === sessionId;
};

module.exports.removeSession = (sessionId) =>
{
    delete _sessions[sessionId];
};