
const uuidv4 = require("uuid").v4;
const assert = require("../../asserter.js");

module.exports = WebSession;

function WebSession(userId)
{
    const _userId = userId;
    const _sessionId = uuidv4();
    var _sessionData = {};


    this.getUserId = () => _userId;
    this.getSessionId = () => _sessionId;
    this.getSessionData = () => 
    {
        if (assert.isObject(_sessionData) === false)
            return { sessionData: _sessionData};

        return Object.create({ 
            sessionData: Object.assign({}, _sessionData)
        });
    };

    this.storeSessionData = (data) =>
    {
        _sessionData = data;
    };

    this.redirectTo = (route, res) =>
    {
        res.redirect(`/${route}?sessionId=${_sessionId}`);
    };
}