
/***********************************************************
*           API RESPONSE CODES (found in .response.status):
*
      "100": "Continue",
      "101": "Switching Protocols",
      "102": "Processing",
      "200": "OK",
      "201": "Created",
      "202": "Accepted",
      "203": "Non-Authoritative Information",
      "204": "No Content",
      "205": "Reset Content",
      "206": "Partial Content",
      "207": "Multi-Status",
      "208": "Already Reported",
      "226": "IM Used",
      "300": "Multiple Choices",
      "301": "Moved Permanently",
      "302": "Found",
      "303": "See Other",
      "304": "Not Modified",
      "305": "Use Proxy",
      "307": "Temporary Redirect",
      "308": "Permanent Redirect",
      "400": "Bad Request",
      "401": "Unauthorized",
      "402": "Payment Required",
      "403": "Forbidden",
      "404": "Not Found",
      "405": "Method Not Allowed",
      "406": "Not Acceptable",
      "407": "Proxy Authentication Required",
      "408": "Request Timeout",
      "409": "Conflict",
      "410": "Gone",
      "411": "Length Required",
      "412": "Precondition Failed",
      "413": "Payload Too Large",
      "414": "URI Too Long",
      "415": "Unsupported Media Type",
      "416": "Range Not Satisfiable",
      "417": "Expectation Failed",
      "418": "I'm a teapot",
      "421": "Misdirected Request",
      "422": "Unprocessable Entity",
      "423": "Locked",
      "424": "Failed Dependency",
      "425": "Unordered Collection",
      "426": "Upgrade Required",
      "428": "Precondition Required",
      "429": "Too Many Requests",
      "431": "Request Header Fields Too Large",
      "451": "Unavailable For Legal Reasons",
      "500": "Internal Server Error",
      "501": "Not Implemented",
      "502": "Bad Gateway",
      "503": "Service Unavailable",
      "504": "Gateway Timeout",
      "505": "HTTP Version Not Supported",
      "506": "Variant Also Negotiates",
      "507": "Insufficient Storage",
      "508": "Loop Detected",
      "509": "Bandwidth Limit Exceeded",
      "510": "Not Extended",
      "511": "Network Authentication Required"
*******************************************************************/


/********************************************************************************************************************************************************
* Node.js quickstart guide: https://developers.google.com/drive/api/v3/quickstart/nodejs                                                                *
* Article: https://medium.com/@humadvii/downloading-files-from-google-drive-using-node-js-3704c142a5f6                                                  *
* Documentation: https://developers.google.com/drive/api/v3/about-sdk                                                                                   *
* Metadata fields property explanation: https://stackoverflow.com/questions/51406491/google-drive-api-v3-doesnt-list-specified-metadata-of-file-folder  *
*                                                                                                                                                       *
* The parameters @param fileId are the google drive file IDs that can be obtained when clicking on "Get Shareable Link" on the google drive website.   *
* The links themselves contain the id, like such: https://drive.google.com/open?id=THIS_IS_THE_FILE_ID                                  *
********************************************************************************************************************************************************/

const fs = require('fs');
const fsp = require('fs').promises;
const log = require("../../logger.js");
const readline = require('readline');
const { google } = require('googleapis');
const MetadataQuery = require("./metadata_query.js");
const DownloadStream = require("./download_stream.js");

const TOKEN_PATH = "./downloader/google_drive_api/token.json";
const CREDENTIALS = require("./credentials.json");

// If modifying these scopes, delete token.json.
//The first scope, https://www.googleapis.com/auth/drive.readonly, is necessary
//to have permissions to access the files' contents, not only the metadata
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly',
                'https://www.googleapis.com/auth/drive.metadata.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

//An oAuth2 object is returned from _authorize() when the authorization is successful,
//and is then passed into many of the functions to be able to interact with google drive files.
//We will store it here when the callback from authorize happens, so the other functions
//can have access to it rather than having to authorize for each operation
let oAuth2Object;
let wasInitialized = false;

// Load client secrets from a local file.
// This is the initialization process.
module.exports.authorize = () =>
{
    return _authorize(CREDENTIALS)
    .then((auth) =>
    {
        //Initialization finished here
        oAuth2Object = auth;
        wasInitialized = true;
    })
    .catch((err) => Promise.reject(err));
};

//Metadata reference: https://developers.google.com/drive/api/v3/reference/files
//fileId is the fileId that can be found in the Get Shareable Link option of the google drive website when right clicking a file
//The link itself contains the ID
module.exports.fetchFileMetadata = function(fileId, fields = null)
{
	//added to make sure the initialization of _authorize() finished before handling requests
	if (wasInitialized === false)
		return Promise.reject("The module was not initialized properly.");

	const metadataQuery = new MetadataQuery(oAuth2Object);

	const getOptions = {
		auth: oAuth2Object,
		fileId: fileId, 
		fields: fields
	};

	const responseOptions = {
		responseType: 'json'
	};

	return metadataQuery.fetchMetadata(getOptions, responseOptions);
};

//Custom function taken from https://medium.com/@humadvii/downloading-files-from-google-drive-using-node-js-3704c142a5f6
//Directly downloads the file into the given path using a WriteStream (specified in responseType)
//fileId is the fileId that can be found in the Get Shareable Link option of the google drive website when right clicking a file
//The link itself contains the ID
module.exports.downloadFile = function(fileId, downloadPath)
{
	//added to make sure the initialization of _authorize() finished before handling requests
	if (wasInitialized === false)
		return Promise.reject(new Error("The module was not initialized properly."));

	const downloadStream = new DownloadStream(oAuth2Object, downloadPath);

	//get file as a stream, then
	//auth must be passed as option with the oAuth2 object that was obtained in the initialization
	//with the _authorize() function.
	//alt: 'media' tells google to grab the file's contents, rather than the metadata
	const getOptions = {
		auth: oAuth2Object, 
		fileId: fileId, 
		alt: 'media'
	};

	//responseType must be marked as stream as well to be able to pipe it
	//and use events on it. A callback is also required, unlike what the google example at
	//https://developers.google.com/drive/api/v3/manage-downloads shows
	const responseTypeOptions = {
		responseType: 'stream'
	};

	return new Promise((resolve, reject) =>
	{
		downloadStream.onDownloadError((err) => reject(err));
		
		downloadStream.onReadError((err) => reject(err));
		downloadStream.onReadEnd(() => log.general(log.getNormalLevel(), `Finished reading file.`));
		downloadStream.onReadClose(() => log.general(log.getNormalLevel(), `Read stream closed.`));

		downloadStream.onWriteError((err) => reject(err));
		downloadStream.onWriteClose(() => log.general(log.getNormalLevel(), `Write stream closed.`));

		//This is the handler that will be called once download 
		//is completely finished and written to disk
		downloadStream.onWriteFinish(() => resolve());

		//Begin the download process after setting all handlers
		downloadStream.startDownload(getOptions, responseTypeOptions);
	});
};

/**
 * Create an OAuth2 client with the given credentials
 * @param {Object} credentials The authorization client credentials.
 */
function _authorize(credentials) 
{
	const { client_secret, client_id, redirect_uris } = credentials.installed;
	const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

	// Check if we have previously stored a token and if not, get one
	if (fs.existsSync(TOKEN_PATH) === false)
		return _getAccessToken(oAuth2Client);

	return fsp.readFile(TOKEN_PATH)
	.then((content) => oAuth2Client.setCredentials(JSON.parse(content)))
	.then(() => Promise.resolve(oAuth2Client));
}

/**
 * Get and store new token after prompting for user authorization
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 */
function _getAccessToken(oAuth2Client) 
{
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	});

	log.general(log.getLeanLevel(), `Authorize this app by visiting this url ${authUrl}`);

	//read the input generated by the user visiting the above URL
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve, reject) =>
	{
		rl.question('Enter the code from that page here: ', (code) => 
		{
			rl.close();

			oAuth2Client.getToken(code, (err, token) => 
			{
				if (err != null)
					return reject(err);

				oAuth2Client.setCredentials(token);

				// Store the token to disk for later program executions
				fsp.writeFile(TOKEN_PATH, JSON.stringify(token))
				.then(() => 
				{
					log.general(log.getNormalLevel(), `Token stored to ${TOKEN_PATH}`);
					resolve(oAuth2Client);
				})
				.catch((err) => reject(err));
			});
		});
	});
}