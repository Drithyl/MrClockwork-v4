
  const assert = require("../../asserter.js");

  module.exports = MenuScreen;

  function MenuScreen(displayText, behaviour)
  {
    assert.isStringOrThrow(displayText);
    assert.isFunctionOrThrow(behaviour);

    const _displayText = displayText;
    const _behaviour = behaviour;

    this.getDisplayText = () => _displayText;
    this.invokeBehaviour = (...args) => _behaviour(...args);
  };