"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var parameterize_1 = require("./util/parameterize");
var include_directive_1 = require("./util/include-directive");
var proxies_1 = require("./proxies");
var request_1 = require("./request");
var refresh_jwt_1 = require("./util/refresh-jwt");
var clonedeep_1 = require("./util/clonedeep");
var Scope = /** @class */ (function () {
    function Scope(model) {
        this._associations = {};
        this._pagination = {};
        this._filter = {};
        this._sort = {};
        this._fields = {};
        this._extra_fields = {};
        this._include = {};
        this._stats = {};
        this.model = model;
    }
    Scope.prototype.all = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var response;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._fetch(this.model.url())];
                    case 1:
                        response = (_a.sent());
                        return [2 /*return*/, this._buildCollectionResult(response)];
                }
            });
        });
    };
    Scope.prototype.find = function (id) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var json;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._fetch(this.model.url(id))];
                    case 1:
                        json = (_a.sent());
                        return [2 /*return*/, this._buildRecordResult(json)];
                }
            });
        });
    };
    Scope.prototype.first = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var newScope, rawResult;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newScope = this.per(1);
                        return [4 /*yield*/, newScope._fetch(newScope.model.url())];
                    case 1:
                        rawResult = (_a.sent());
                        return [2 /*return*/, this._buildRecordResult(rawResult)];
                }
            });
        });
    };
    Scope.prototype.merge = function (obj) {
        var copy = this.copy();
        Object.keys(obj).forEach(function (k) {
            copy._associations[k] = obj[k];
        });
        return copy;
    };
    Scope.prototype.page = function (pageNumber) {
        var copy = this.copy();
        copy._pagination.number = pageNumber;
        return copy;
    };
    Scope.prototype.per = function (size) {
        var copy = this.copy();
        copy._pagination.size = size;
        return copy;
    };
    Scope.prototype.where = function (clause) {
        var copy = this.copy();
        for (var key in clause) {
            if (clause.hasOwnProperty(key)) {
                copy._filter[key] = clause[key];
            }
        }
        return copy;
    };
    Scope.prototype.stats = function (clause) {
        var copy = this.copy();
        for (var key in clause) {
            if (clause.hasOwnProperty(key)) {
                copy._stats[key] = clause[key];
            }
        }
        return copy;
    };
    Scope.prototype.order = function (clause) {
        var copy = this.copy();
        if (typeof clause === "object") {
            for (var key in clause) {
                if (clause.hasOwnProperty(key)) {
                    copy._sort[key] = clause[key];
                }
            }
        }
        else {
            copy._sort[clause] = "asc";
        }
        return copy;
    };
    Scope.prototype.select = function (clause) {
        var copy = this.copy();
        for (var key in clause) {
            if (clause.hasOwnProperty(key)) {
                copy._fields[key] = clause[key];
            }
        }
        return copy;
    };
    Scope.prototype.selectExtra = function (clause) {
        var copy = this.copy();
        for (var key in clause) {
            if (clause.hasOwnProperty(key)) {
                copy._extra_fields[key] = clause[key];
            }
        }
        return copy;
    };
    Scope.prototype.includes = function (clause) {
        var copy = this.copy();
        var directive = new include_directive_1.IncludeDirective(clause);
        var directiveObject = directive.toScopeObject();
        for (var key in directiveObject) {
            if (directiveObject.hasOwnProperty(key)) {
                copy._include[key] = directiveObject[key];
            }
        }
        return copy;
    };
    // The `Model` class has a `scope()` method to return the scope for it.
    // This method makes it possible for methods to expect either a model or
    // a scope and reliably cast them to a scope for use via `scope()`
    Scope.prototype.scope = function () {
        return this;
    };
    Scope.prototype.asQueryParams = function () {
        var qp = {
            page: this._pagination,
            filter: this._filter,
            sort: this._sortParam(this._sort) || [],
            fields: this._fields,
            extra_fields: this._extra_fields,
            stats: this._stats,
            include: new include_directive_1.IncludeDirective(this._include).toString()
        };
        this._mergeAssociationQueryParams(qp, this._associations);
        return qp;
    };
    Scope.prototype.toQueryParams = function () {
        var paramString = parameterize_1.default(this.asQueryParams());
        if (paramString !== "") {
            return paramString;
        }
    };
    Scope.prototype.copy = function () {
        var newScope = clonedeep_1.cloneDeep(this);
        return newScope;
    };
    // private
    Scope.prototype._mergeAssociationQueryParams = function (queryParams, associations) {
        var _this = this;
        var _loop_1 = function (key) {
            if (associations.hasOwnProperty(key)) {
                var associationScope = associations[key];
                var associationQueryParams = associationScope.asQueryParams();
                queryParams.page[key] = associationQueryParams.page;
                queryParams.filter[key] = associationQueryParams.filter;
                queryParams.stats[key] = associationQueryParams.stats;
                associationQueryParams.sort.forEach(function (s) {
                    var transformed = _this._transformAssociationSortParam(key, s);
                    queryParams.sort.push(transformed);
                });
            }
        };
        for (var key in associations) {
            _loop_1(key);
        }
    };
    Scope.prototype._transformAssociationSortParam = function (associationName, param) {
        if (param.indexOf("-") !== -1) {
            param = param.replace("-", "");
            associationName = "-" + associationName;
        }
        return associationName + "." + param;
    };
    Scope.prototype._sortParam = function (clause) {
        if (clause && Object.keys(clause).length > 0) {
            var params = [];
            for (var key in clause) {
                if (clause.hasOwnProperty(key)) {
                    if (clause[key] !== "asc") {
                        key = "-" + key;
                    }
                    params.push(key);
                }
            }
            return params;
        }
    };
    Scope.prototype._fetch = function (url) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var qp, request, fetchOpts, response;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        qp = this.toQueryParams();
                        if (qp) {
                            url = url + "?" + qp;
                        }
                        request = new request_1.Request(this.model.middlewareStack, this.model.logger);
                        fetchOpts = this.model.fetchOptions();
                        return [4 /*yield*/, request.get(url, fetchOpts)];
                    case 1:
                        response = _a.sent();
                        refresh_jwt_1.refreshJWT(this.model, response);
                        return [2 /*return*/, response.jsonPayload];
                }
            });
        });
    };
    Scope.prototype._buildRecordResult = function (jsonResult) {
        var record;
        var rawRecord;
        if (jsonResult.data instanceof Array) {
            rawRecord = jsonResult.data[0];
        }
        else {
            rawRecord = jsonResult.data;
        }
        record = this.model.fromJsonapi(rawRecord, jsonResult);
        return new proxies_1.RecordProxy(record, jsonResult);
    };
    Scope.prototype._buildCollectionResult = function (jsonResult) {
        var _this = this;
        var recordArray = [];
        jsonResult.data.forEach(function (record) {
            recordArray.push(_this.model.fromJsonapi(record, jsonResult));
        });
        return new proxies_1.CollectionProxy(recordArray, jsonResult);
    };
    return Scope;
}());
exports.Scope = Scope;
//# sourceMappingURL=scope.js.map