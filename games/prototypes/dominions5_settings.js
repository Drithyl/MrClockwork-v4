
const fs = require("fs");
const assert = require("../../asserter.js");

const GameSettings = require("./game_settings.js");

const AiNations = require("../../game_settings/dom5/prototypes/ai_nations.js");
const ArtifactForging = require("../../game_settings/dom5/prototypes/artifact_forging.js");
const AscensionPoints = require("../../game_settings/dom5/prototypes/ascension_points.js");
const Cataclysm = require("../../game_settings/dom5/prototypes/cataclysm.js");
const DefaultAiLevel = require("../../game_settings/dom5/prototypes/default_ai_level.js");
const Disciples = require("../../game_settings/dom5/prototypes/disciples.js");
const Era = require("../../game_settings/dom5/prototypes/era.js");
const EventRarity = require("../../game_settings/dom5/prototypes/event_rarity.js");
const GlobalSlots = require("../../game_settings/dom5/prototypes/global_slots.js");
const GoldModifier = require("../../game_settings/dom5/prototypes/gold_modifier.js");
const HallOfFame = require("../../game_settings/dom5/prototypes/hall_of_fame.js");
const IndependentsStrength = require("../../game_settings/dom5/prototypes/independents_strength.js");
const MagicSites = require("../../game_settings/dom5/prototypes/magic_sites.js");
const Map = require("../../game_settings/dom5/prototypes/map.js");
const MasterPassword = require("../../game_settings/dom5/prototypes/master_password.js");
const Mods = require("../../game_settings/dom5/prototypes/mods.js");
const Name = require("../../game_settings/dom5/prototypes/name.js");
const RecruitmentModifier = require("../../game_settings/dom5/prototypes/recruitment_modifier.js");
const ResearchSpeed = require("../../game_settings/dom5/prototypes/research_speed.js");
const ResourcesModifier = require("../../game_settings/dom5/prototypes/resources_modifier.js");
const Scoregraphs = require("../../game_settings/dom5/prototypes/scoregraphs.js");
const StartingProvinces = require("../../game_settings/dom5/prototypes/starting_provinces.js");
const StartingResearch = require("../../game_settings/dom5/prototypes/starting_research.js");
const StoryEvents = require("../../game_settings/dom5/prototypes/story_events.js");
const SuppliesModifier = require("../../game_settings/dom5/prototypes/supplies_modifier.js");
const Thrones = require("../../game_settings/dom5/prototypes/thrones.js");
const TimerSetting = require("../../game_settings/dom5/prototypes/timer.js");

async function load(pathToDataDir)
{
    assert.isStringOrThrow(pathToDataDir);

    var stringData = fs.readFileSync(`${pathToDataDir}/dominions5_settings.json`, "utf8");
    var parsedData = JSON.parse(stringData);
    var dominions5Settings = new Dominions5Settings();
    
    dominions5Settings.forEachSettingObject((settingObject, key) =>
    {
        var loadedValueData = parsedData[key];

        settingObject.setValue(loadedValueData);
    });

    return dominions5Settings;
}

module.exports = Dominions5Settings;

function Dominions5Settings(parentGameObject)
{
    const _parentGame = parentGameObject;
    const _gameSettingsObject = new GameSettings(parentGameObject);

    const _aiNations = new AiNations(_parentGame);
    const _artifactForging = new ArtifactForging(_parentGame);
    const _ascensionPoints = new AscensionPoints(_parentGame);
    const _cataclysm = new Cataclysm(_parentGame);
    const _defaultAiLevel = new DefaultAiLevel(_parentGame);
    const _disciples = new Disciples(_parentGame);
    const _era = new Era(_parentGame);
    const _eventRarity = new EventRarity(_parentGame);
    const _globalSlots = new GlobalSlots(_parentGame);
    const _goldModifier = new GoldModifier(_parentGame);
    const _hallOfFame = new HallOfFame(_parentGame);
    const _independentsStrength = new IndependentsStrength(_parentGame);
    const _magicSites = new MagicSites(_parentGame);
    const _map = new Map(_parentGame);
    const _masterPassword = new MasterPassword(_parentGame);
    const _mods = new Mods(_parentGame);
    const _name = new Name(_parentGame);
    const _recruitmentModifier = new RecruitmentModifier(_parentGame);
    const _researchSpeed = new ResearchSpeed(_parentGame);
    const _resourcesModifier = new ResourcesModifier(_parentGame);
    const _scoregraphs = new Scoregraphs(_parentGame);
    const _startingProvinces = new StartingProvinces(_parentGame);
    const _startingResearch = new StartingResearch(_parentGame);
    const _storyEvents = new StoryEvents(_parentGame);
    const _suppliesModifier = new SuppliesModifier(_parentGame);
    const _thrones = new Thrones(_parentGame);
    const _timerSetting = new TimerSetting(_parentGame);

    //ORDER MATTERS! era has to come before aiNations, for example!
    _gameSettingsObject.addSettingObjects(
        _name,
        _map,
        _mods,
        _era,
        _aiNations,
        _defaultAiLevel,
        _artifactForging,
        _ascensionPoints,
        _cataclysm,
        _disciples,
        _eventRarity,
        _globalSlots,
        _goldModifier,
        _resourcesModifier,
        _suppliesModifier,
        _recruitmentModifier,
        _hallOfFame,
        _independentsStrength,
        _magicSites,
        _masterPassword,
        _researchSpeed,
        _scoregraphs,
        _startingProvinces,
        _startingResearch,
        _storyEvents,
        _thrones,
        _timerSetting
    );

    _gameSettingsObject.getAiNationsSetting = () => _aiNations;
    _gameSettingsObject.getArtifactForgingSetting = () => _artifactForging;
    _gameSettingsObject.getAscensionPointsSetting = () => _ascensionPoints;
    _gameSettingsObject.getCataclysmSetting = () => _cataclysm;
    _gameSettingsObject.getDefaultAiLevelSetting = () => _defaultAiLevel;
    _gameSettingsObject.getDisciplesSetting = () => _disciples;
    _gameSettingsObject.getEraSetting = () => _era;
    _gameSettingsObject.getEventRaritySetting = () => _eventRarity;
    _gameSettingsObject.getGlobalSlotsSetting = () => _globalSlots;
    _gameSettingsObject.getGoldModifierSetting = () => _goldModifier;
    _gameSettingsObject.getHallOfFameSetting = () => _hallOfFame;
    _gameSettingsObject.getIndependentsStrengthSetting = () => _independentsStrength;
    _gameSettingsObject.getMagicSitesSetting = () => _magicSites;
    _gameSettingsObject.getMapSetting = () => _map;
    _gameSettingsObject.getMasterPasswordSetting = () => _masterPassword;
    _gameSettingsObject.getModsSetting = () => _mods;
    _gameSettingsObject.getNameSetting = () => _name;
    _gameSettingsObject.getRecruitmentModifierSetting = () => _recruitmentModifier;
    _gameSettingsObject.getResearchSpeedSetting = () => _researchSpeed;
    _gameSettingsObject.getResourcesModifierSetting = () => _resourcesModifier;
    _gameSettingsObject.getScoregraphsSetting = () => _scoregraphs;
    _gameSettingsObject.getStartingProvincesSetting = () => _startingProvinces;
    _gameSettingsObject.getStartingResearchSetting = () => _startingResearch;
    _gameSettingsObject.getStoryEventsSetting = () => _storyEvents;
    _gameSettingsObject.getSuppliesModifierSetting = () => _suppliesModifier;
    _gameSettingsObject.getThronesSetting = () => _thrones;
    _gameSettingsObject.getTimerSetting = () => _timerSetting;

    return _gameSettingsObject;
}