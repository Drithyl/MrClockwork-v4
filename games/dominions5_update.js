
const Dominions5StatusSnapshot = require("./prototypes/dominions5_status_snapshot");


module.exports = parseDom5Update;

function parseDom5Update(gameObject, updateData)
{
    const statusdumpWrapper = updateData.statusdump;
    const statusSnapshot = new Dominions5StatusSnapshot();
    statusSnapshot.setIsServerOnline(gameObject.isServerOnline());

    if (statusSnapshot.isServerOnline() === false)
        return statusSnapshot;


    statusSnapshot.setUptime(updateData.uptime);
    statusSnapshot.setIsOnline(updateData.isOnline);

    if (statusSnapshot.isOnline() === false)
        return statusSnapshot;

        
    if (statusdumpWrapper == null)
        return statusSnapshot;


    statusSnapshot.setTurnNumber(statusdumpWrapper.turnNbr);
    statusSnapshot.setPlayers(statusdumpWrapper.nationStatusArray);
    statusSnapshot.setSuccessfulCheckTimestamp(Date.now());
    statusSnapshot.setLastUpdateTimestamp(statusdumpWrapper.lastUpdateTimestamp);
    statusSnapshot.setHasStarted(statusdumpWrapper.hasStarted);

    return statusSnapshot;
}
