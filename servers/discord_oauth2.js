

const fetch = require("node-fetch");
const log = require("../logger.js");
const config = require("../config/config.json");

/** data to make the request for the authorization code */
const _appData = {
    client_id: config.discordClientId,
    client_secret: config.discordClientSecret,

    /** where the authentication info will be sent; must be the same as the
     *  authorized redirect in https://discord.com/developers/applications/721522017249263737/oauth2
     *  and the same as the redirect specified in the OAuth2 URL in the index.html page
     */
    redirect_uri: config.discordRedirectUri
};

/** the scopes determine the information we can fetch from the Discord user,
 *  see https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
 */
const _scope = "identify";


/** The url is returned from discord's authentication page and
 *  should contain an access code if it all worked properly
 */
exports.authenticate = async (urlObject) =>
{
    _appData.code = urlObject.searchParams.get("code");

    if (_appData.code == null)
        throw new Error(`Access code not found.`);

    
    const token = await _requestToken(_appData, _scope);
    log.general(log.getNormalLevel(), `Token info received after authentication`, token);
    
    const userData = await _fetchUserData(token);
    log.general(log.getNormalLevel(), `User info received after authentication`, userData);

    return userData;
};


async function _fetchUserData(token)
{
    try {
        return _requestUserData(token);

    } catch (error) {

        if (err.error === "invalid_token")
        {
            const refreshedToken = await _requestToRefreshToken(_appData, _scope, token.refresh_token);
            const userData = await _requestUserData(refreshedToken);
            return userData;
        }

        //else if ask for user to grant the app access as they might have revoked it
        else throw new Error(`Error fetching user information: ${err.message},\n\n${err.stack}`);
    }
}

async function _makeTokenRequest(requestData)
{
    const request = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: new URLSearchParams(requestData),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });

    return request.json();
}

function _requestToken(applicationData, scope)
{
    /** the grant_type authorization_code will give us a token and a refresh token
     *   https://discordjs.guide/oauth2/#oauth2-flows
     */
    const requestData = Object.assign(applicationData, { 
        
        grant_type: "authorization_code", 
        scope 
    });

    return _makeTokenRequest(requestData);
}

function _requestToRefreshToken(applicationData, scope, refreshToken)
{
    /** the grant_type refresh_token will refresh the token we had received by sending
     *  the refresh token contained inside it: 
     *  https://www.oauth.com/oauth2-servers/making-authenticated-requests/refreshing-an-access-token/
     */
    const requestData = Object.assign(applicationData, { 
        grant_type: "refresh_token", 
        refresh_token: refreshToken,
        scope 
    });

    return _makeTokenRequest(requestData);
}

async function _requestUserData(tokenInfo)
{
    const request = await fetch("https://discord.com/api/users/@me", {
        headers: {
            authorization: `${tokenInfo.token_type} ${tokenInfo.access_token}`
        }
    });

    return request.json();
}