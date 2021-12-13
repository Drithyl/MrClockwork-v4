
const log = require("../logger.js");

module.exports = function(mapData)
{
	var provLines;
	var terrainMask;
	var provCount = {total: 0, land: 0, sea: 0};

	if (mapData == null)
	{
		log.error(log.getNormalLevel(), "mapData PROVIDED IS NULL");
		return null;
	}

	if (/\w+/.test(mapData) == false)
	{
		log.error(log.getNormalLevel(), "mapData CONTAINS NO WORDS");
		return null;
	}

	if (/\#terrain\s+\d+\s+\d+/ig.test(mapData) === false)
	{
		log.error(log.getNormalLevel(), "mapData CONTAINS NO #terrain TAGS");
		return null;
	}

	provLines = mapData.match(/\#terrain\s+\d+\s+\d+/g);

	for (var i = 0; i < provLines.length; i++)
	{
		terrainMask = +provLines[i].slice(provLines[i].indexOf(" ", provLines[i].indexOf(" ") + 1) + 1).replace(/\D/g, "");

		//4 is the sea code and 2052 is the deep sea code in the .map files
		if ((terrainMask 			  % 4 == 0 &&    terrainMask 			% 8 != 0) ||
		    ((terrainMask - 1) 	% 4 == 0 && (terrainMask - 1) 	% 8 != 0) ||
			((terrainMask - 2) 	% 4 == 0 && (terrainMask - 2) 	% 8 != 0))
		{
			provCount.sea++;
		}
	}

	provCount.total = provLines.length;
	provCount.land = provCount.total - provCount.sea;
	return provCount;
};
