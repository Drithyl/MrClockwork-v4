
const assert = require("../../asserter.js");

module.exports = MenuScreen;

function MenuScreen(displayText, behaviour)
{
    assert.isStringOrThrow(displayText);
    assert.isFunctionOrThrow(behaviour);

    var _displayText = displayText;
    const _behaviour = behaviour;

    this.getDisplayText = () => _displayText;
    this.setDisplayText = (displayStr) =>
    {
        assert.isStringOrThrow(displayStr);
        _displayText = displayStr;
    };

    this.invokeBehaviour = (...args) => _behaviour(...args);
}