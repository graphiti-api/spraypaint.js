"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        return this._fetch(this.model.url()).then(function (json) {
            var collection = new proxies_1.CollectionProxy(json);
            return collection;
        });
    };
    Scope.prototype.find = function (id) {
        return this._fetch(this.model.url(id)).then(function (json) {
            return new proxies_1.RecordProxy(json);
        });
    };
    Scope.prototype.first = function () {
        var newScope = this.per(1);
        return newScope._fetch(newScope.model.url()).then(function (json) {
            json.data = json.data[0];
            return new proxies_1.RecordProxy(json);
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
            copy._filter[key] = clause[key];
        }
        return copy;
    };
    Scope.prototype.stats = function (clause) {
        var copy = this.copy();
        for (var key in clause) {
            copy._stats[key] = clause[key];
        }
        return copy;
    };
    Scope.prototype.order = function (clause) {
        var copy = this.copy();
        if (typeof clause == "object") {
            for (var key in clause) {
                copy._sort[key] = clause[key];
            }
        }
        else {
            copy._sort[clause] = 'asc';
        }
        return copy;
    };
    Scope.prototype.select = function (clause) {
        var copy = this.copy();
        for (var key in clause) {
            copy._fields[key] = clause[key];
        }
        return copy;
    };
    Scope.prototype.selectExtra = function (clause) {
        var copy = this.copy();
        for (var key in clause) {
            copy._extra_fields[key] = clause[key];
        }
        return copy;
    };
    Scope.prototype.includes = function (clause) {
        var copy = this.copy();
        var directive = new include_directive_1.default(clause);
        var directiveObject = directive.toObject();
        for (var key in directiveObject) {
            copy._include[key] = directiveObject[key];
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
        var qp = {};
        qp['page'] = this._pagination;
        qp['filter'] = this._filter;
        qp['sort'] = this._sortParam(this._sort) || [];
        qp['fields'] = this._fields;
        qp['extra_fields'] = this._extra_fields;
        qp['stats'] = this._stats;
        qp['include'] = new include_directive_1.default(this._include).toString();
        this._mergeAssociationQueryParams(qp, this._associations);
        return qp;
    };
    Scope.prototype.toQueryParams = function () {
        var paramString = parameterize_1.default(this.asQueryParams());
        if (paramString !== '') {
            return paramString;
        }
    };
    Scope.prototype.copy = function () {
        var newScope = clonedeep_1.default(this);
        return newScope;
    };
    // private
    Scope.prototype._mergeAssociationQueryParams = function (queryParams, associations) {
        var _this = this;
        var _loop_1 = function (key) {
            var associationScope = associations[key];
            var associationQueryParams = associationScope.asQueryParams();
            queryParams['page'][key] = associationQueryParams['page'];
            queryParams['filter'][key] = associationQueryParams['filter'];
            queryParams['stats'][key] = associationQueryParams['stats'];
            associationQueryParams['sort'].forEach(function (s) {
                var transformed = _this._transformAssociationSortParam(key, s);
                queryParams['sort'].push(transformed);
            });
        };
        for (var key in associations) {
            _loop_1(key);
        }
    };
    Scope.prototype._transformAssociationSortParam = function (associationName, param) {
        if (param.indexOf('-') !== -1) {
            param = param.replace('-', '');
            associationName = "-" + associationName;
        }
        return associationName + "." + param;
    };
    Scope.prototype._sortParam = function (clause) {
        if (clause && Object.keys(clause).length > 0) {
            var params = [];
            for (var key in clause) {
                if (clause[key] !== 'asc') {
                    key = "-" + key;
                }
                params.push(key);
            }
            return params;
        }
    };
    Scope.prototype._fetch = function (url) {
        var _this = this;
        var qp = this.toQueryParams();
        if (qp) {
            url = url + "?" + qp;
        }
        var request = new request_1.default();
        var fetchOpts = this.model.fetchOptions();
        return request.get(url, fetchOpts).then(function (response) {
            refresh_jwt_1.default(_this.model, response);
            return response['jsonPayload'];
        });
    };
    return Scope;
}());
exports.default = Scope;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NvcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2NvcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxvREFBK0M7QUFDL0MsOERBQXdEO0FBQ3hELHFDQUF5RDtBQUN6RCxxQ0FBZ0M7QUFFaEMsa0RBQTRDO0FBQzVDLDhDQUF5QztBQUV6QztJQVdFLGVBQVksS0FBb0I7UUFUaEMsa0JBQWEsR0FBVyxFQUFFLENBQUM7UUFDM0IsZ0JBQVcsR0FBdUMsRUFBRSxDQUFDO1FBQ3JELFlBQU8sR0FBVyxFQUFFLENBQUM7UUFDckIsVUFBSyxHQUFXLEVBQUUsQ0FBQztRQUNuQixZQUFPLEdBQVcsRUFBRSxDQUFDO1FBQ3JCLGtCQUFhLEdBQVcsRUFBRSxDQUFDO1FBQzNCLGFBQVEsR0FBVyxFQUFFLENBQUM7UUFDdEIsV0FBTSxHQUFXLEVBQUUsQ0FBQztRQUdsQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNyQixDQUFDO0lBRUQsbUJBQUcsR0FBSDtRQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFjO1lBQ3ZELElBQUksVUFBVSxHQUFHLElBQUkseUJBQWUsQ0FBUSxJQUFJLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsVUFBVSxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELG9CQUFJLEdBQUosVUFBSyxFQUFvQjtRQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLElBQWM7WUFDekQsTUFBTSxDQUFDLElBQUkscUJBQVcsQ0FBUSxJQUFJLENBQUMsQ0FBQztRQUN0QyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxx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