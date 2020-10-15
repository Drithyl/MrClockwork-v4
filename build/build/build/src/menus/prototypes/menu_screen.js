"use strict";
var assert = require("../../asserter.js");
module.exports = MenuScreen;
function MenuScreen(displayText, behaviour) {
    assert.isStringOrThrow(displayText);
    assert.isFunctionOrThrow(behaviour);
    var _displayText = displayText;
    var _behaviour = behaviour;
    this.getDisplayText = function () { return _displayText; };
    this.invokeBehaviour = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return _behaviour.apply(void 0, args);
    };
}
;
//# sourceMappingURL=menu_screen.js.map