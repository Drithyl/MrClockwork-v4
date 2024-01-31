
const DominionsStatusSnapshot = require("./prototypes/dominions_status_snapshot");


module.exports = parseDomUpdate;

function parseDomUpdate(gameObject, updateData)
{
    const statusdumpWrapper = updateData.statusdump;
    const statusSnapshot = new DominionsStatusSnapshot();
    statusSnapshot.setIsServerOnline(gameObject.isServerOnline());

    if (statusSnapshot.isServerOnline() === false)
        return statusSnapshot;


    statusSnapshot.setUptime(updateData.uptime);
    statusSnapshot.setIsOnline(updateData.isOnline);

    if (statusSnapshot.isOnline() === false)
        return statusSnapshot;

        
    if (statusdumpWrapper == null)
        return statusSnapshot;


    statusSnapshot.setTurnNumber(statusdumpWrapper.turnNumber);
    statusSnapshot.setPlayers(statusdumpWrapper.nationStatuses);
    statusSnapshot.setSuccessfulCheckTimestamp(Date.now());
    statusSnapshot.setLastUpdateTimestamp(statusdumpWrapper.lastUpdateTimestamp);
    statusSnapshot.setHasStarted(statusdumpWrapper.hasStarted);

    return statusSnapshot;
}