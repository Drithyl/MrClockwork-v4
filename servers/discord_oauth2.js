

const fetch = require("node-fetch");
const config = require("../config/config.json");

/** data to make the request for the authorization code */
const data = {
    client_id: config.discordClientId,
    client_secret: config.discordClientSecret,

    /** where the authentication info will be sent; must be the same as the
     *  authorized redirect in https://discord.com/developers/applications/721522017249263737/oauth2
     *  and the same as the redirect specified in the OAuth2 URL in the index.html page
     */
    redirect_uri: "http://localhost:3000/login",

    /** authorization_code will give us refresh tokens so the user does not need to go through
     *  the process every time: https://discordjs.guide/oauth2/#oauth2-flows
     */
    grant_type: "authorization_code",

    /** the scopes determine the information we can fetch from the Discord user,
     *  see https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
     */
    scope: "identify"
};

/** The url is returned from discord's authentication page and
 *  should contain an access code if it all worked properly
 */
exports.authenticate = (urlObject) =>
{
    data.code = urlObject.searchParams.get("code");

    if (data.code == null)
        return Promise.reject(new Error(`Access code not found.`));
    
    return _fetchToken()
    .then((tokenInfo) => _fetchUserInfo(tokenInfo));
};

function _fetchToken()
{
    return fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: new URLSearchParams(data),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    .then((discordResponse) => discordResponse.json())
    .then((tokenInfo) =>
    {
        console.log(`Token info received: `, tokenInfo);
        return Promise.resolve(tokenInfo);
    })
    .catch((err) => Promise.reject(new Error(`Error fetching token: ${err.message},\n\n${err.stack}`)));
}

function _fetchUserInfo(tokenInfo)
{
    return fetch("https://discord.com/api/users/@me", {
        headers: {
            authorization: `${tokenInfo.token_type} ${tokenInfo.access_token}`
        }
    })
    .then((userResponse) => userResponse.json())
    .then((userInfo) =>
    {
        console.log(`User info received: `, userInfo);
        return Promise.resolve(userInfo);
    })
    .catch((err) => Promise.reject(new Error(`Error fetching user information: ${err.message},\n\n${err.stack}`)));
}