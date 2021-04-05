
const log = require("../../logger.js");
const activeMenuStore = require("../active_menu_store.js");

const testHostInput = [
    "testGame",
    "3manblitz.map",
    "DomEnhanced1_67.dm,WH_6_24.dm",
    "1",
    "17 easy, 18 normal",
    
];

module.exports.testHost = (hostMenu) =>
{
    log.general(log.getLeanLevel(), "Using test input...");
    return testInput();

    function testInput(inputIndex = 0)
    {
        if (inputIndex >= testHostInput.length)
        {
            log.general(log.getLeanLevel(), `Finished testing`);
            activeMenuStore.finish(hostMenu.getId());
            return;
        }

        return hostMenu.handleInput(testHostInput[inputIndex])
        .then(() => testInput(++inputIndex))
        .catch((err) => 
        {
            log.error(log.getLeanLevel(), `ERROR HANDLING TEST INPUT`, err);
            activeMenuStore.finish(hostMenu.getId());
        });
    }
};