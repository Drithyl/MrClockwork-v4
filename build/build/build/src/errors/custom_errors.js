"use strict";
// See https://javascript.info/custom-errors and https://medium.com/p/aa891b173f87/responses/show
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) {
                for (var p in b)
                    if (Object.prototype.hasOwnProperty.call(b, p))
                        d[p] = b[p];
            };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.InstanceOfError = /** @class */ (function (_super) {
    __extends(InstanceOfError, _super);
    function InstanceOfError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "InstanceOfError";
        return _this;
    }
    return InstanceOfError;
}(Error));
exports.InvalidPathError = /** @class */ (function (_super) {
    __extends(InvalidPathError, _super);
    function InvalidPathError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "InvalidPathError";
        return _this;
    }
    return InvalidPathError;
}(Error));
exports.LengthError = /** @class */ (function (_super) {
    __extends(LengthError, _super);
    function LengthError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "LengthError";
        return _this;
    }
    return LengthError;
}(Error));
exports.PermissionsError = /** @class */ (function (_super) {
    __extends(PermissionsError, _super);
    function PermissionsError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "PermissionsError";
        return _this;
    }
    return PermissionsError;
}(Error));
exports.RangeError = /** @class */ (function (_super) {
    __extends(RangeError, _super);
    function RangeError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "RangeError";
        return _this;
    }
    return RangeError;
}(Error));
exports.SemanticError = /** @class */ (function (_super) {
    __extends(SemanticError, _super);
    function SemanticError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "SemanticError";
        return _this;
    }
    return SemanticError;
}(Error));
exports.SocketResponseError = /** @class */ (function (_super) {
    __extends(SocketResponseError, _super);
    function SocketResponseError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "SocketResponseError";
        return _this;
    }
    return SocketResponseError;
}(Error));
exports.StdError = /** @class */ (function (_super) {
    __extends(StdError, _super);
    function StdError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "StdError";
        return _this;
    }
    return StdError;
}(Error));
exports.TimeoutError = /** @class */ (function (_super) {
    __extends(TimeoutError, _super);
    function TimeoutError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "TimeoutError";
        return _this;
    }
    return TimeoutError;
}(Error));
exports.TypeError = /** @class */ (function (_super) {
    __extends(TypeError, _super);
    function TypeError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = "TypeError";
        return _this;
    }
    return TypeError;
}(Error));
//# sourceMappingURL=custom_errors.js.map