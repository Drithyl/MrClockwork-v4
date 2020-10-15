"use strict";
var assert = require("../../asserter.js");
var RangeError = require("../../errors/custom_errors.js").RangeError;
module.exports = MenuStructure;
function MenuStructure(guildMemberWrapper, contextData) {
    var _this = this;
    var _guildMemberWrapper = guildMemberWrapper;
    var _contextData = contextData;
    var _screens = [];
    var _screenHistoryIndex = [];
    var _introductionMessage = null;
    var _onFinishedMenu = null;
    var _onInputValidated = null;
    var _currentScreenIndex = null;
    this.getId = function () { return _guildMemberWrapper.getId(); };
    this.addIntroductionMessage = function (introductionString) {
        assert.isString(introductionString);
        _introductionMessage = introductionString;
    };
    this.startMenu = function () {
        return Promise.resolve(function () {
            if (assert.isString(_introductionMessage) === true)
                return _guildMemberWrapper.sendMessage(_introductionMessage);
            else
                return Promise.resolve();
        })
            .then(function () { return _this.goToScreenAtIndex(0); });
    };
    this.sendMessage = function (message) { return _guildMemberWrapper.sendMessage(message); };
    this.sendCurrentScreenDisplay = function () { return _sendCurrentScreenDisplay(); };
    this.addScreens = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.forEach(function (screenObject) { return _screens.push(screenObject); });
    };
    this.addBehaviourOnFinishedMenu = function (behaviour) {
        assert.isFunction(behaviour);
        _onFinishedMenu = behaviour;
    };
    this.addBehaviourOnInputValidated = function (behaviour) {
        assert.isFunction(behaviour);
        _onInputValidated = behaviour;
    };
    this.handleInput = function (input) {
        if (input === "?TEST")
            return require("./tester.js").testHost(_this);
        var currentScreen = _getCurrentScreen();
        return Promise.resolve(currentScreen.invokeBehaviour(input))
            .then(function (response) {
            if (assert.isString(response) === true && assert.isMoreThanNCharacters(0) === true)
                _guildMemberWrapper.sendMessage(response);
            if (assert.isFunction(_onInputValidated) === true)
                _onInputValidated(_currentScreenIndex);
        })
            .catch(function (err) { return _guildMemberWrapper.sendMessage(err.message); });
    };
    this.goToNextScreen = function () {
        if (_hasNextScreen() === false)
            if (_onFinishedMenu != null)
                return _onFinishedMenu();
        _screenHistoryIndex.push(_currentScreenIndex);
        _currentScreenIndex++;
        _sendCurrentScreenDisplay();
    };
    this.goToScreenAtIndex = function (index) {
        if (index >= _screens.length)
            throw new RangeError("No menu screen available at index " + index + ".");
        if (_currentScreenIndex >= 0)
            _screenHistoryIndex.push(_currentScreenIndex);
        _currentScreenIndex = index;
        _sendCurrentScreenDisplay();
    };
    this.goBackToPreviousScreen = function () {
        _goBackToPreviousScreen();
        _sendCurrentScreenDisplay();
    };
    function _hasNextScreen() {
        return _currentScreenIndex < _screens.length - 1;
    }
    function _getCurrentScreen() {
        return _screens[_currentScreenIndex];
    }
    function _sendCurrentScreenDisplay() {
        var currentScreenObject = _getCurrentScreen();
        var currentScreenDisplayText = currentScreenObject.getDisplayText();
        _guildMemberWrapper.sendMessage(currentScreenDisplayText);
    }
    function _goBackToPreviousScreen() {
        if (_screenHistoryIndex.length > 1)
            _currentScreenIndex = _screenHistoryIndex.shift();
    }
    //TODO Add the below menu commands?
    /*if (backRegexp.test(input) === true)
    {
        console.log(`User requested to go back one step.`);
        return instance.goBack();
    }

    else if (endRegexp.test(input) === true)
    {
        console.log(`User requested to end instance.`);
        return module.exports.finish(userId);
    }*/
}
//# sourceMappingURL=menu_structure.js.map