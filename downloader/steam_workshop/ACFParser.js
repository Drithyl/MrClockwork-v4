const os = require("os");

module.exports = class ACFParser {

    /**
     * Takes the content of an .acf Steam file in utf8 format and returns an array of
     * objects with the following shape: { id: <String>, lastUpdatedTime: <String> },
     * where id is the id of a workshop item that is currently tracked, and lastUpdatedTime
     * is a timestamp in ms of the last time the item was updated by steamcmd.
     * 
     * At the bottom of this file is an example .acf file content.
     * 
     * @param {String} acfFileContent - A utf8 string that is the whole .acf file content
     * @returns {Array<Object>} - an array of { id, lastUpdatedTime } objects
     */
    static parseWorkshopItemUpdatedTimes(acfFileContent) {
        const lines = acfFileContent.split(/\r?\n/);

        const workshopItemsInstalledHeader = lines.find(l => l.includes("WorkshopItemsInstalled"));
        const indexOfWorkshopItemsInstalledHeader = lines.indexOf(workshopItemsInstalledHeader);

        const workshopItemDetailsHeader = lines.find(l => l.includes("WorkshopItemDetails"));
        const indexOfWorkshopItemDetailsHeader = lines.indexOf(workshopItemDetailsHeader);

        const itemLines = lines.slice(
            (indexOfWorkshopItemsInstalledHeader >= 0) ? indexOfWorkshopItemsInstalledHeader : 0,
            (indexOfWorkshopItemDetailsHeader >= 0) ? indexOfWorkshopItemDetailsHeader : 0
        );

        const itemChunks = [];

        let currentItemChunkIndex = -1;
        itemLines.forEach((line) => {
            const isNewItemHeader = /^\t+"\d{10}"$/.test(line);

            if (isNewItemHeader === true) {
                currentItemChunkIndex++;
                itemChunks[currentItemChunkIndex] = line;
            }

            else if (itemChunks[currentItemChunkIndex] != null) {
                itemChunks[currentItemChunkIndex] += `${os.EOL}${line}`;
            }
        });

        const itemUpdateTimes = itemChunks.map((l) => {
            const itemIdMatch = l.match(/\t+"\d{10}"/);
            const itemUpdateTimestampMatch = l.match(/\t+"timeupdated"\t+"\d+"/);

            if (itemIdMatch != null) {
                const item = {
                    id: itemIdMatch[0].replace(/\D/g, "")
                };

                if (itemUpdateTimestampMatch != null) {
                    item.lastUpdatedTime = itemUpdateTimestampMatch[0].replace(/\D/g, "");
                }

                return item;
            }
        });

        return itemUpdateTimes;
    }
};


/**
 * EXAMPLE CONTENT OF A STEAMCMD .acf FILE:
 * /

"AppWorkshop"
{
	"appid"		"2511500"
	"SizeOnDisk"		"9504095"
	"NeedsUpdate"		"1"
	"NeedsDownload"		"0"
	"TimeLastUpdated"		"1711784978"
	"TimeLastAppRan"		"0"
	"WorkshopItemsInstalled"
	{
		"3084600890"
		{
			"size"		"9009973"
			"timeupdated"		"1700088507"
			"manifest"		"1525222949293434380"
		}
		"3140298160"
		{
			"size"		"494122"
			"timeupdated"		"1707141897"
			"manifest"		"7316542853858676789"
		}
	}
	"WorkshopItemDetails"
	{
		"3084600890"
		{
			"manifest"		"686214682283864791"
			"timeupdated"		"1706967842"
			"timetouched"		"1706402787"
		}
		"3140298160"
		{
			"manifest"		"7316542853858676789"
			"timeupdated"		"1707141897"
			"timetouched"		"1711810619"
		}
	}
}

*/