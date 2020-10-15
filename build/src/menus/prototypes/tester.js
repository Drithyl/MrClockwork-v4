"use strict";
var activeMenuStore = require("../active_menu_store.js");
var testHostInput = [
    "testGame",
    "3manblitz.map",
    "DomEnhanced1_67.dm,WH_6_24.dm",
    "1",
    "17 easy, 18 normal",
];
module.exports.testHost = function (hostMenu) {
    console.log("Using test input...");
    return testInput();
    function testInput(inputIndex) {
        if (inputIndex === void 0) { inputIndex = 0; }
        if (inputIndex >= testHostInput.length) {
            console.log("Finished testing");
            activeMenuStore.finish(hostMenu.getId());
            return;
        }
        return hostMenu.handleInput(testHostInput[inputIndex])
            .then(function () { return testInput(++inputIndex); })
            .catch(function (err) {
            console.log(err.message);
            activeMenuStore.finish(hostMenu.getId());
        });
    }
};
//# sourceMappingURL=tester.js.map