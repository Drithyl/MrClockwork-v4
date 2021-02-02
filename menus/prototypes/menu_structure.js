
const assert = require("../../asserter.js");
const RangeError = require("../../errors/custom_errors.js").RangeError;

module.exports = MenuStructure;

function MenuStructure(guildMemberWrapper, contextData)
{
    const _guildMemberWrapper = guildMemberWrapper;
    const _contextData = contextData;
    const _screens = [];
    const _screenHistoryIndex = [];
    
    var _introductionMessage = null;

    var _onFinishedMenu = null;
    var _onInputValidated = null;
    var _currentScreenIndex = 0;

    this.getId = () => _guildMemberWrapper.getId();

    this.addIntroductionMessage = (introductionString) =>
    {
        assert.isString(introductionString);
        _introductionMessage = introductionString;
    };

    this.startMenu = () =>
    {
        return Promise.resolve()
        .then(() =>
        {
            if (assert.isString(_introductionMessage) === true)
                return _guildMemberWrapper.sendMessage(_introductionMessage);

            else return Promise.resolve();
        })
        .then(() => this.goToScreenAtIndex(0));
    };

    this.sendMessage = (message) => _guildMemberWrapper.sendMessage(message);

    this.sendCurrentScreenDisplay = () => _sendCurrentScreenDisplay();

    this.addScreens = (...args) =>
    {
        args.forEach((screenObject) => _screens.push(screenObject));
    };

    this.addBehaviourOnFinishedMenu = (behaviour) =>
    {
        assert.isFunction(behaviour);
        _onFinishedMenu = behaviour;
    };

    this.addBehaviourOnInputValidated = (behaviour) =>
    {
        assert.isFunction(behaviour);
        _onInputValidated = behaviour;
    };

    this.handleInput = (input) =>
    {
        if (input === "?TEST")
            return require("./tester.js").testHost(this);

        var currentScreen = _getCurrentScreen();

        return Promise.resolve(currentScreen.invokeBehaviour(input))
        .then((response) => 
        {
            if (assert.isString(response) === true && assert.isMoreThanNCharacters(0) === true)
                _guildMemberWrapper.sendMessage(response);

            if (assert.isFunction(_onInputValidated) === true)
                _onInputValidated(_currentScreenIndex);
        })
        .catch((err) => _guildMemberWrapper.sendMessage(err.message));
    };

    this.goToNextScreen = () =>
    {
        if (_hasNextScreen() === false)
            if (_onFinishedMenu != null)
                return _onFinishedMenu();
        
        _screenHistoryIndex.push(_currentScreenIndex);
        _currentScreenIndex++;
        _sendCurrentScreenDisplay();
    };

    this.goToScreenAtIndex = (index) =>
    {
        if (index >= _screens.length)
            throw new RangeError(`No menu screen available at index ${index}.`);
        
        if (_currentScreenIndex >= 0)
            _screenHistoryIndex.push(_currentScreenIndex);
            
        _currentScreenIndex = index;
        _sendCurrentScreenDisplay();
    };

    this.goBackToPreviousScreen = () =>
    {
        _goBackToPreviousScreen();
        _sendCurrentScreenDisplay();
    };

    function _hasNextScreen()
    {
        return _currentScreenIndex < _screens.length - 1;
    }

    function _getCurrentScreen()
    {
        return _screens[_currentScreenIndex];
    }

    function _sendCurrentScreenDisplay()
    {
        var currentScreenObject = _getCurrentScreen();
        var currentScreenDisplayText = currentScreenObject.getDisplayText();

        _guildMemberWrapper.sendMessage(currentScreenDisplayText);
    }

    function _goBackToPreviousScreen()
    {
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