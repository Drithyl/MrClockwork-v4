
const fs = require("fs");
const config = require("./config/config.json");
const { TypeError, RangeError, LengthError, SemanticError, InstanceOfError, InvalidDiscordIdError, InvalidPathError, PermissionsError } = require("./errors/custom_errors.js");


exports.isArray = isArray;
exports.isObject = isObject;
exports.isSerializedBuffer = isSerializedBuffer;
exports.isString = isString;
exports.isNumber = isNumber;
exports.isInteger = isInteger;
exports.isBoolean = isBoolean;
exports.isFunction = isFunction;
exports.isRegexp = isRegexp;
exports.isParsedByRegexp = isParsedByRegexp;
exports.isLessThanNCharacters = isLessThanNCharacters;
exports.isMoreThanNCharacters = isMoreThanNCharacters;
exports.isNumberInRange = isNumberInRange;
exports.isStringInArray = isStringInArray;
exports.isInstanceOfPrototype = isInstanceOfPrototype;
exports.isPermissionsError = isPermissionsError;
exports.isSemanticError = isSemanticError;
exports.doesStringEndIn = doesStringEndIn;
exports.isValidGameType = isValidGameType;
exports.isDom5GameType = isDom5GameType;
exports.isDom6GameType = isDom6GameType;
exports.isValidPath = isValidPath;
exports.isValidDiscordId = isValidDiscordId;

exports.isArrayOrThrow = isArrayOrThrow;
exports.isObjectOrThrow = isObjectOrThrow;
exports.isSerializedBufferOrThrow = isSerializedBufferOrThrow;
exports.isStringOrThrow = isStringOrThrow;
exports.isNumberOrThrow = isNumberOrThrow;
exports.isIntegerOrThrow = isIntegerOrThrow;
exports.isBooleanOrThrow = isBooleanOrThrow;
exports.isFunctionOrThrow = isFunctionOrThrow;
exports.isRegexpOrThrow = isRegexpOrThrow;
exports.isParsedByRegexpOrThrow = isParsedByRegexpOrThrow;
exports.isLessThanNCharactersOrThrow = isLessThanNCharactersOrThrow;
exports.isMoreThanNCharactersOrThrow = isMoreThanNCharactersOrThrow;
exports.isNumberInRangeOrThrow = isNumberInRangeOrThrow;
exports.isStringInArrayOrThrow = isStringInArrayOrThrow;
exports.isInstanceOfPrototypeOrThrow = isInstanceOfPrototypeOrThrow;
exports.isSemanticErrorOrThrow = isSemanticErrorOrThrow;
exports.doesStringEndInOrThrow = doesStringEndInOrThrow;
exports.isValidGameTypeOrThrow = isValidGameTypeOrThrow;
exports.isValidPathOrThrow = isValidPathOrThrow;
exports.isValidDiscordIdOrThrow = isValidDiscordIdOrThrow;


function isArray(arr)
{
	return Array.isArray(arr);
}

function isObject(obj)
{
	return Array.isArray(obj) === false && typeof obj === "object" && obj != null;
}

function isSerializedBuffer(obj)
{
  return isObject(obj) === true && obj.type === "Buffer" && isArray(obj.data) === true;
}

function isString(str)
{
	return typeof str === "string";
}

function isBoolean(bool)
{
	return typeof bool === "boolean";
}

function isFunction(fn)
{
	return typeof fn === "function";
}

function isRegexp(regexp)
{
	return RegExp.prototype.isPrototypeOf(regexp) === true;
}

function isParsedByRegexp(str, regexp)
{
	return regexp.test(str) === true;
}

function isLessThanNCharacters(str, n)
{
	return str.length < n;
}

function isMoreThanNCharacters(str, n)
{
	return str.length > n;
}

function isNumber(nbr)
{
	return isNaN(nbr) === false;
}

function isInteger(nbr)
{
	return Number.isInteger(nbr);
}

function isNumberInRange(nbr, min, max)
{
	return nbr > min && nbr < max;
}

function isStringInArray(str, array)
{
	return array.includes(str) === true;
}

function isInstanceOfPrototype(instance, prototypeDef)
{
	return prototypeDef.prototype.isPrototypeOf(instance);
}

function isPermissionsError(error)
{
	return isInstanceOfPrototype(error, PermissionsError);
}

function isSemanticError(error)
{
	return isInstanceOfPrototype(error, SemanticError);
}

function doesStringEndIn(str, ending)
{
	return isArray(str.match(`^.*${ending}$`));
}

function isValidPath(path)
{
	return fs.existsSync(path);
}

function isValidDiscordId(id)
{
	return isString(id) === true && /^\d+$/.test(id) === true;
}

function isValidGameType(gameType)
{
  if (isString(gameType) === false)
    return false;

  if (gameType.toLowerCase() === config.dom5GameTypeName.toLowerCase() ||
      gameType.toLowerCase() === config.dom6GameTypeName.toLowerCase())
  {
    return true;
  }

  else return false;
}

function isDom5GameType(gameType)
{
  if (isValidGameType(gameType) === false)
    return false;

  return gameType.toLowerCase() === config.dom5GameTypeName.toLowerCase();
}

function isDom6GameType(gameType)
{
  if (isValidGameType(gameType) === false)
    return false;

  return gameType.toLowerCase() === config.dom6GameTypeName.toLowerCase();
}

function isArrayOrThrow(arr)
{
  if (isArray(arr) === false)
    throw new TypeError(`Expected Array, got: <${arr}> (${typeof arr})`);
}

function isObjectOrThrow(obj)
{
  if (isObject(obj) === false)
    throw new TypeError(`Expected Object, got: <${obj}> (${typeof obj})`);
}

function isSerializedBufferOrThrow(obj)
{
  if (isSerializedBuffer(obj) === false)
    throw new TypeError(`Expected Serialized Buffer, got: <${obj}> (${typeof obj})`);
}

function isStringOrThrow(str)
{
  if (isString(str) === false)
    throw new TypeError(`Expected String, got: <${str}> (${typeof str})`);
}

function isNumberOrThrow(nbr)
{
  if (isNumber(nbr) === false)
    throw new TypeError(`Expected Number, got: <${nbr}> (${typeof nbr})`);
}

function isIntegerOrThrow(nbr)
{
  if (isInteger(nbr) === false)
    throw new TypeError(`Expected Integer, got: <${nbr}> (${typeof nbr})`);
}

function isBooleanOrThrow(bool)
{
  if (isBoolean(bool) === false)
    throw new TypeError(`Expected Boolean, got: <${bool}> (${typeof bool})`);
}

function isFunctionOrThrow(fn)
{
  if (isFunction(fn) === false)
    throw new TypeError(`Expected Function, got: <${fn}> (${typeof fn})`);
}

function isRegexpOrThrow(regexp)
{
  if (isRegexp(regexp) === false)
    throw new TypeError(`Expected RegExp, got: <${regexp}> (${typeof regexp})`);
}

function isParsedByRegexpOrThrow(str, regexp)
{
  isRegexpOrThrow(regexp);

  if (isParsedByRegexp(str, regexp) === false)
    throw new SemanticError(`String could not be parsed by regexp: ${str}`);
}

function isLessThanNCharactersOrThrow(str, n)
{
  if (isLessThanNCharacters(str, n) === false)
    throw new LengthError(`Expected String to be less than ${n} characters, got: <${str.length}>`);
}

function isMoreThanNCharactersOrThrow(str, n)
{
  if (isMoreThanNCharacters(str, n) === false)
    throw new LengthError(`Expected String to be more than ${n} characters, got: <${str.length}>`);
}

function isNumberInRangeOrThrow(nbr, min, max)
{
  isNumberOrThrow(nbr);
  isNumberOrThrow(min);
  isNumberOrThrow(max);

  if (isNumberInRange(nbr, min, max) === false)
    throw new SemanticError(`Expected Number > ${min} and < ${max}, got: <${nbr}>`);
}

function isStringInArrayOrThrow(str, array)
{
  if (isStringInArray(str, array) === false)
    throw new SemanticError(`Got <${str}>, expected it to be one of: ${array}`);
}

function isInstanceOfPrototypeOrThrow(instance, prototypeDef)
{
  if (isInstanceOfPrototype(instance, prototypeDef) === false)
    throw new InstanceOfError(`Expected instance of ${prototypeDef.name}, got: <${instance}>`);
}

function isSemanticErrorOrThrow(error)
{
  if (isSemanticError(error) === false)
    throw new InstanceOfError(`Expected instance of ${SemanticError.name}, got: <${error}>`);
}

function doesStringEndInOrThrow(str, ending)
{
  isStringOrThrow(str);
  isStringOrThrow(ending);

  if (doesStringEndIn(str, ending) === false)
    throw new SemanticError(`Expected string to end in <${ending}>, got <${str}>`);
}

function isValidGameTypeOrThrow(gameType)
{
  if (isValidGameType(gameType) === false)
    throw new SemanticError(`Value of gameType does not match any configured value, got: <${gameType}>`);
}

function isValidPathOrThrow(path)
{
  if (isValidPath(path) === false)
    throw new InvalidPathError(`Path does not exist: ${path}`);
}

function isValidDiscordIdOrThrow(id)
{
    if (isValidDiscordId(id) === false)
      throw new InvalidDiscordIdError(`Id is not a valid Discord Id: ${id}`);
}