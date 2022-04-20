
const { google } = require('googleapis');

module.exports = MetadataQuery;

function MetadataQuery(oAuth2Object)
{
    const drive = google.drive({version:"v3", oAuth2Object});

    this.fetchMetadata = (getOptions, responseTypeOptions) =>
    {
        //if fields is not specified or is not a string, default to basic metadata information
        if (typeof getOptions.fields !== "string")
            getOptions.fields = "id,name,fileExtension,size";

        //auth must be passed as option with the oAuth2 object that was obtained in the initialization
        //with the _authorize() function.
        return new Promise((resolve, reject) =>
        {
            drive.files.get(getOptions, responseTypeOptions, function(err, response)
            {
                /*err.response has the following fields:
                {
                "status": 404,
                "statusText": "Not Found",
                "data": "Not Found"
                }*/
                if (err)
                    return reject(err.response);

                resolve(response.data);
            });
        });
    };
}