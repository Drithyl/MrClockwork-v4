
const GameSetting = require("../../prototypes/game_setting.js");
const dom5SettingFlags = require("../../../json/dominions5_setting_flags.json");
const SemanticError = require("../../../errors/custom_errors.js").SemanticError;

const key = "storyEvents";

module.exports = StoryEvents;

function StoryEvents()
{
    var _value;

    this.getValue = () => _value;
    this.getReadableValue = () =>
    {
        var value = this.getValue();

        if (value == dom5SettingFlags.NO_STORY_EVENTS)
            return "Disabled";

        if (value == dom5SettingFlags.MINOR_STORY_EVENTS_ONLY)
            return "Minor";
        
        if (value == dom5SettingFlags.FULL_STORY_EVENTS)
            return "Full";

        else return "Invalid value"
    };
    
    this.setValue = (input) =>
    {
        const validatedValue = _validateInputFormatOrThrow(input);

        _value = validatedValue;
    };

    this.fromJSON = (value) =>
    {
        if (Number.isInteger(value) === false)
            throw new Error(`Expected integer; got ${value}`);

        _value = value;
    };

    this.translateValueToCmdFlag = () =>
    {
        var value = this.getValue();
    
        if (value ===  dom5SettingFlags.NO_STORY_EVENTS)
            return ["--nostoryevents"]
    
        else if (value === dom5SettingFlags.MINOR_STORY_EVENTS_ONLY)
            return ["--storyevents"]
    
        else return [`--allstoryevents`];
    };

    function _validateInputFormatOrThrow(input)
    {
        if (StoryEvents.prototype.isExpectedFormat(input) === false)
            throw new SemanticError(`Invalid value format for the story events.`);

        return +input.replace(/\D*/, "");
    }
}

//sets the base object to be instanced from the GameSetting
//constructor, with all its properties included. These will 
//be shared across all instances of the StoryEvents constructor.
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
StoryEvents.prototype = new GameSetting(key);
StoryEvents.prototype.constructor = StoryEvents;

StoryEvents.prototype.getPrompt = () => StoryEvents.prototype.getDescription();
