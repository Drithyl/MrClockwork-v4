
// See https://javascript.info/custom-errors and https://medium.com/p/aa891b173f87/responses/show

exports.InstanceOfError = class InstanceOfError extends Error
{
  constructor(message)
  {
    super(message);
    this.name = "InstanceOfError";
  }
}

exports.InvalidPathError = class InvalidPathError extends Error
{
  constructor(message)
  {
    super(message);
    this.name = "InvalidPathError";
  }
}

exports.LengthError = class LengthError extends Error
{
  constructor(message)
  {
    super(message);
    this.name = "LengthError";
  }
}

exports.PermissionsError = class PermissionsError extends Error
{
  constructor(message)
  {
    super(message);
    this.name = "PermissionsError";
  }
}

exports.RangeError = class RangeError extends Error
{
  constructor(message)
  {
    super(message);
    this.name = "RangeError";
  }
}

exports.SemanticError = class SemanticError extends Error
{
  constructor(message)
  {
    super(message);
    this.name = "SemanticError";
  }
}

exports.SocketResponseError = class SocketResponseError extends Error
{
  constructor(message)
  {
    super(message);
    this.name = "SocketResponseError";
  }
}

exports.StdError = class StdError extends Error
{
  constructor(message)
  {
    super(message);
    this.name = "StdError";
  }
}

exports.TimeoutError = class TimeoutError extends Error
{
  constructor(message)
  {
    super(message);
    this.name = "TimeoutError";
  }
}

exports.TypeError = class TypeError extends Error
{
  constructor(message)
  {
    super(message);
    this.name = "TypeError";
  }
}
