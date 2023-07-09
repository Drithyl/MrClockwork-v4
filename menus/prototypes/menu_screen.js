
const assert = require("../../asserter.js");

module.exports = MenuScreen;

function MenuScreen(displayText, behaviour)
{
    assert.isStringOrThrow(displayText);
    assert.isFunctionOrThrow(behaviour);

    let _displayText = displayText;
    const _behaviour = behaviour;

    this.getDisplayText = () => _displayText;
    this.setDisplayText = (newText) =>
    {
        assert.isStringOrThrow(newText);
        _displayText = newText;
    };

    this.invokeBehaviour = (...args) => _behaviour(...args);
}