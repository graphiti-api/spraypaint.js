"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var colorize_1 = require("./util/colorize");
var Request = /** @class */ (function () {
    function Request(middleware, logger) {
        this.middleware = middleware;
        this.logger = logger;
    }
    Request.prototype.get = function (url, options) {
        options.method = "GET";
        return this._fetchWithLogging(url, options);
    };
    Request.prototype.post = function (url, payload, options) {
        options.method = "POST";
        options.body = JSON.stringify(payload);
        return this._fetchWithLogging(url, options);
    };
    Request.prototype.patch = function (url, payload, options) {
        options.method = "PATCH";
        options.body = JSON.stringify(payload);
        return this._fetchWithLogging(url, options);
    };
    Request.prototype.delete = function (url, options) {
        options.method = "DELETE";
        return this._fetchWithLogging(url, options);
    };
    // private
    Request.prototype._logRequest = function (verb, url) {
        this.logger.info(colorize_1.default("cyan", verb + ": ") + colorize_1.default("magenta", url));
    };
    Request.prototype._logResponse = function (responseJSON) {
        this.logger.debug(colorize_1.default("bold", JSON.stringify(responseJSON, null, 4)));
    };
    Request.prototype._fetchWithLogging = function (url, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var response;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._logRequest(options.method || "UNDEFINED METHOD", url);
                        return [4 /*yield*/, this._fetch(url, options)];
                    case 1:
                        response = _a.sent();
                        this._logResponse(response.jsonPayload);
                        return [2 /*return*/, response];
                }
            });
        });
    };
    Request.prototype._fetch = function (url, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var response, e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        try {
                            this.middleware.beforeFetch(url, options);
                        }
                        catch (e) {
                            throw new RequestError("beforeFetch failed; review middleware.beforeFetch stack", url, options, e);
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fetch(url, options)];
                    case 2:
                        response = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        throw new ResponseError(null, e_1.message, e_1);
                    case 4: return [4 /*yield*/, this._handleResponse(response, options)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    Request.prototype._handleResponse = function (response, requestOptions) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var wasDelete, json, e_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        wasDelete = requestOptions.method === "DELETE" &&
                            [202, 204, 200].indexOf(response.status) > -1;
                        if (wasDelete)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, response.json()];
                    case 2:
                        json = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        throw new ResponseError(response, "invalid json", e_2);
                    case 4:
                        try {
                            this.middleware.afterFetch(response, json);
                        }
                        catch (e) {
                            // afterFetch middleware failed
                            throw new ResponseError(response, "afterFetch failed; review middleware.afterFetch stack", e);
                        }
                        if (response.status >= 500) {
                            throw new ResponseError(response, "Server Error");
                            // Allow 422 since we specially handle validation errors
                        }
                        else if (response.status !== 422 && json.data === undefined) {
                            if (response.status === 404) {
                                throw new ResponseError(response, "record not found");
                            }
                            else {
                                // Bad JSON, for instance an errors payload
                                throw new ResponseError(response, "invalid json");
                            }
                        }
                        ;
                        response.jsonPayload = json;
                        return [2 /*return*/];
                }
            });
        });
    };
    return Request;
}());
exports.Request = Request;
var RequestError = /** @class */ (function (_super) {
    tslib_1.__extends(RequestError, _super);
    function RequestError(message, url, options, originalError) {
        var _this = _super.call(this, message) || this;
        _this.stack = originalError.stack;
        _this.url = url;
        _this.options = options;
        _this.originalError = originalError;
        return _this;
    }
    return RequestError;
}(Error));
var ResponseError = /** @class */ (function (_super) {
    tslib_1.__extends(ResponseError, _super);
    function ResponseError(response, message, originalError) {
        var _this = _super.call(this, message || "Invalid Response") || this;
        _this.response = response;
        _this.originalError = originalError;
        return _this;
    }
    return ResponseError;
}(Error));
//# sourceMappingURL=request.js.map