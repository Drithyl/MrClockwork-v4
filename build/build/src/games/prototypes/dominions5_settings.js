"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1)
            throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f)
            throw new TypeError("Generator is already executing.");
        while (_)
            try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                    return t;
                if (y = 0, t)
                    op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0:
                    case 1:
                        t = op;
                        break;
                    case 4:
                        _.label++;
                        return { value: op[1], done: false };
                    case 5:
                        _.label++;
                        y = op[1];
                        op = [0];
                        continue;
                    case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;
                            continue;
                        }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                            _.label = op[1];
                            break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];
                            t = op;
                            break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];
                            _.ops.push(op);
                            break;
                        }
                        if (t[2])
                            _.ops.pop();
                        _.trys.pop();
                        continue;
                }
                op = body.call(thisArg, _);
            }
            catch (e) {
                op = [6, e];
                y = 0;
            }
            finally {
                f = t = 0;
            }
        if (op[0] & 5)
            throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var fs = require("fs");
var assert = require("../../asserter.js");
var GameSettings = require("./game_settings.js");
var AiNations = require("../../game_settings/dom5/prototypes/ai_nations.js");
var ArtifactForging = require("../../game_settings/dom5/prototypes/artifact_forging.js");
var AscensionPoints = require("../../game_settings/dom5/prototypes/ascension_points.js");
var Cataclysm = require("../../game_settings/dom5/prototypes/cataclysm.js");
var DefaultAiLevel = require("../../game_settings/dom5/prototypes/default_ai_level.js");
var Disciples = require("../../game_settings/dom5/prototypes/disciples.js");
var Era = require("../../game_settings/dom5/prototypes/era.js");
var EventRarity = require("../../game_settings/dom5/prototypes/event_rarity.js");
var GlobalSlots = require("../../game_settings/dom5/prototypes/global_slots.js");
var GoldModifier = require("../../game_settings/dom5/prototypes/gold_modifier.js");
var HallOfFame = require("../../game_settings/dom5/prototypes/hall_of_fame.js");
var IndependentsStrength = require("../../game_settings/dom5/prototypes/independents_strength.js");
var MagicSites = require("../../game_settings/dom5/prototypes/magic_sites.js");
var Map = require("../../game_settings/dom5/prototypes/map.js");
var MasterPassword = require("../../game_settings/dom5/prototypes/master_password.js");
var Mods = require("../../game_settings/dom5/prototypes/mods.js");
var Name = require("../../game_settings/dom5/prototypes/name.js");
var RecruitmentModifier = require("../../game_settings/dom5/prototypes/recruitment_modifier.js");
var ResearchSpeed = require("../../game_settings/dom5/prototypes/research_speed.js");
var ResourcesModifier = require("../../game_settings/dom5/prototypes/resources_modifier.js");
var Scoregraphs = require("../../game_settings/dom5/prototypes/scoregraphs.js");
var StartingProvinces = require("../../game_settings/dom5/prototypes/starting_provinces.js");
var StartingResearch = require("../../game_settings/dom5/prototypes/starting_research.js");
var StoryEvents = require("../../game_settings/dom5/prototypes/story_events.js");
var SuppliesModifier = require("../../game_settings/dom5/prototypes/supplies_modifier.js");
var Thrones = require("../../game_settings/dom5/prototypes/thrones.js");
var TimerSetting = require("../../game_settings/dom5/prototypes/timer.js");
function load(pathToDataDir) {
    return __awaiter(this, void 0, void 0, function () {
        var stringData, parsedData, dominions5Settings;
        return __generator(this, function (_a) {
            assert.isStringOrThrow(pathToDataDir);
            stringData = fs.readFileSync(pathToDataDir + "/dominions5_settings.json", "utf8");
            parsedData = JSON.parse(stringData);
            dominions5Settings = new Dominions5Settings();
            dominions5Settings.forEachSettingObject(function (settingObject, key) {
                var loadedValueData = parsedData[key];
                settingObject.setValue(loadedValueData);
            });
            return [2 /*return*/, dominions5Settings];
        });
    });
}
module.exports = Dominions5Settings;
function Dominions5Settings(parentGameObject) {
    var _parentGame = parentGameObject;
    var _gameSettingsObject = new GameSettings(parentGameObject);
    var _aiNations = new AiNations(_parentGame);
    var _artifactForging = new ArtifactForging(_parentGame);
    var _ascensionPoints = new AscensionPoints(_parentGame);
    var _cataclysm = new Cataclysm(_parentGame);
    var _defaultAiLevel = new DefaultAiLevel(_parentGame);
    var _disciples = new Disciples(_parentGame);
    var _era = new Era(_parentGame);
    var _eventRarity = new EventRarity(_parentGame);
    var _globalSlots = new GlobalSlots(_parentGame);
    var _goldModifier = new GoldModifier(_parentGame);
    var _hallOfFame = new HallOfFame(_parentGame);
    var _independentsStrength = new IndependentsStrength(_parentGame);
    var _magicSites = new MagicSites(_parentGame);
    var _map = new Map(_parentGame);
    var _masterPassword = new MasterPassword(_parentGame);
    var _mods = new Mods(_parentGame);
    var _name = new Name(_parentGame);
    var _recruitmentModifier = new RecruitmentModifier(_parentGame);
    var _researchSpeed = new ResearchSpeed(_parentGame);
    var _resourcesModifier = new ResourcesModifier(_parentGame);
    var _scoregraphs = new Scoregraphs(_parentGame);
    var _startingProvinces = new StartingProvinces(_parentGame);
    var _startingResearch = new StartingResearch(_parentGame);
    var _storyEvents = new StoryEvents(_parentGame);
    var _suppliesModifier = new SuppliesModifier(_parentGame);
    var _thrones = new Thrones(_parentGame);
    var _timerSetting = new TimerSetting(_parentGame);
    //ORDER MATTERS! era has to come before aiNations, for example!
    _gameSettingsObject.addSettingObjects(_name, _map, _mods, _era, _aiNations, _defaultAiLevel, _artifactForging, _ascensionPoints, _cataclysm, _disciples, _eventRarity, _globalSlots, _goldModifier, _resourcesModifier, _suppliesModifier, _recruitmentModifier, _hallOfFame, _independentsStrength, _magicSites, _masterPassword, _researchSpeed, _scoregraphs, _startingProvinces, _startingResearch, _storyEvents, _thrones, _timerSetting);
    _gameSettingsObject.getAiNationsSetting = function () { return _aiNations; };
    _gameSettingsObject.getArtifactForgingSetting = function () { return _artifactForging; };
    _gameSettingsObject.getAscensionPointsSetting = function () { return _ascensionPoints; };
    _gameSettingsObject.getCataclysmSetting = function () { return _cataclysm; };
    _gameSettingsObject.getDefaultAiLevelSetting = function () { return _defaultAiLevel; };
    _gameSettingsObject.getDisciplesSetting = function () { return _disciples; };
    _gameSettingsObject.getEraSetting = function () { return _era; };
    _gameSettingsObject.getEventRaritySetting = function () { return _eventRarity; };
    _gameSettingsObject.getGlobalSlotsSetting = function () { return _globalSlots; };
    _gameSettingsObject.getGoldModifierSetting = function () { return _goldModifier; };
    _gameSettingsObject.getHallOfFameSetting = function () { return _hallOfFame; };
    _gameSettingsObject.getIndependentsStrengthSetting = function () { return _independentsStrength; };
    _gameSettingsObject.getMagicSitesSetting = function () { return _magicSites; };
    _gameSettingsObject.getMapSetting = function () { return _map; };
    _gameSettingsObject.getMasterPasswordSetting = function () { return _masterPassword; };
    _gameSettingsObject.getModsSetting = function () { return _mods; };
    _gameSettingsObject.getNameSetting = function () { return _name; };
    _gameSettingsObject.getRecruitmentModifierSetting = function () { return _recruitmentModifier; };
    _gameSettingsObject.getResearchSpeedSetting = function () { return _researchSpeed; };
    _gameSettingsObject.getResourcesModifierSetting = function () { return _resourcesModifier; };
    _gameSettingsObject.getScoregraphsSetting = function () { return _scoregraphs; };
    _gameSettingsObject.getStartingProvincesSetting = function () { return _startingProvinces; };
    _gameSettingsObject.getStartingResearchSetting = function () { return _startingResearch; };
    _gameSettingsObject.getStoryEventsSetting = function () { return _storyEvents; };
    _gameSettingsObject.getSuppliesModifierSetting = function () { return _suppliesModifier; };
    _gameSettingsObject.getThronesSetting = function () { return _thrones; };
    _gameSettingsObject.getTimerSetting = function () { return _timerSetting; };
    return _gameSettingsObject;
}
//# sourceMappingURL=dominions5_settings.js.map