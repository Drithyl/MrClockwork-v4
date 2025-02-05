
const log = require("../../logger.js");
const { debounceSubsequent } = require("../../utilities/debounce-utilities.js");
const { updateDominionsVersion } = require("../../servers/host_server_store.js");

module.exports = () =>
{
    debounceSubsequent(() => {
        log.general(log.getLeanLevel(), "Event/new_dominions_version_available triggered - sending request to servers to update Dominions version");
        updateDominionsVersion();
    }, 60000);
};
