"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var scope_1 = require("../scope");
var configuration_1 = require("../configuration");
var deserialize_1 = require("../util/deserialize");
var extend_1 = require("../util/extend");
var string_1 = require("../util/string");
var write_payload_1 = require("../util/write-payload");
var dirty_check_1 = require("../util/dirty-check");
var validation_errors_1 = require("../util/validation-errors");
var refresh_jwt_1 = require("../util/refresh-jwt");
var relationship_identifiers_1 = require("../util/relationship-identifiers");
var request_1 = require("../request");
var clonedeep_1 = require("../util/clonedeep");
var Model = /** @class */ (function () {
    function Model(attributes) {
        this._attributes = {};
        this._originalAttributes = {};
        this._originalRelationships = {};
        this.relationships = {};
        this.errors = {};
        this.__meta__ = null;
        this._persisted = false;
        this._markedForDestruction = false;
        this._markedForDisassociation = false;
        this._initializeAttributes();
        this.attributes = attributes;
        this._originalAttributes = clonedeep_1.default(this.attributes);
        this._originalRelationships = this.relationshipResourceIdentifiers(Object.keys(this.relationships));
    }
    Model.extend = function (obj) {
        return extend_1.default(this, obj);
    };
    Model.inherited = function (subclass) {
        configuration_1.default.models.push(subclass);
        subclass.parentClass = this;
        subclass.prototype.klass = subclass;
        subclass.attributeList = clonedeep_1.default(subclass.attributeList);
    };
    Model.scope = function () {
        return this._scope || new scope_1.default(this);
    };
    Model.setJWT = function (token) {
        this.getJWTOwner().jwt = token;
    };
    Model.getJWT = function () {
        var owner = this.getJWTOwner();
        if (owner) {
            return owner.jwt;
        }
    };
    Model.fetchOptions = function () {
        var options = {
            headers: (_a = {
                    Accept: 'application/json'
                },
                _a['Content-Type'] = 'application/json',
                _a)
        };
        if (this.getJWT()) {
            options.headers.Authorization = "Token token=\"" + this.getJWT() + "\"";
        }
        return options;
        var _a;
    };
    Model.getJWTOwner = function () {
        if (this.isJWTOwner) {
            return this;
        }
        else {
            if (this.parentClass) {
                return this.parentClass.getJWTOwner();
            }
            else {
                return;
            }
        }
    };
    Model.all = function () {
        return this.scope().all();
    };
    Model.find = function (id) {
        return this.scope().find(id);
    };
    Model.first = function () {
        return this.scope().first();
    };
    Model.where = function (clause) {
        return this.scope().where(clause);
    };
    Model.page = function (number) {
        return this.scope().page(number);
    };
    Model.per = function (size) {
        return this.scope().per(size);
    };
    Model.order = function (clause) {
        return this.scope().order(clause);
    };
    Model.select = function (clause) {
        return this.scope().select(clause);
    };
    Model.selectExtra = function (clause) {
        return this.scope().selectExtra(clause);
    };
    Model.stats = function (clause) {
        return this.scope().stats(clause);
    };
    Model.includes = function (clause) {
        return this.scope().includes(clause);
    };
    Model.merge = function (obj) {
        return this.scope().merge(obj);
    };
    Model.url = function (id) {
        var endpoint = this.endpoint || "/" + this.jsonapiType;
        var base = "" + this.fullBasePath() + endpoint;
        if (id) {
            base = base + "/" + id;
        }
        return base;
    };
    Model.fullBasePath = function () {
        return "" + this.baseUrl + this.apiNamespace;
    };
    Model.fromJsonapi = function (resource, payload) {
        return deserialize_1.deserialize(resource, payload);
    };
    Model.prototype.clearErrors = function () {
        this.errors = {};
    };
    // Todo:
    // * needs to recurse the directive
    // * remove the corresponding code from isPersisted and handle here (likely
    // only an issue with test setup)
    // * Make all calls go through resetRelationTracking();
    Model.prototype.resetRelationTracking = function (includeDirective) {
        this._originalRelationships = this.relationshipResourceIdentifiers(Object.keys(includeDirective));
    };
    Model.prototype.relationshipResourceIdentifiers = function (relationNames) {
        return relationship_identifiers_1.default(this, relationNames);
    };
    Model.prototype.isType = function (jsonapiType) {
        return this.klass.jsonapiType === jsonapiType;
    };
    Object.defineProperty(Model.prototype, "resourceIdentifier", {
        get: function () {
            return { type: this.klass.jsonapiType, id: this.id };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "attributes", {
        get: function () {
            return this._attributes;
        },
        set: function (attrs) {
            this._attributes = {};
            this.assignAttributes(attrs);
        },
        enumerable: true,
        configurable: true
    });
    Model.prototype.assignAttributes = function (attrs) {
        for (var key in attrs) {
            var attributeName = key;
            if (this.klass.camelizeKeys) {
                attributeName = string_1.camelize(key);
            }
            if (key == 'id' || this.klass.attributeList[attributeName]) {
                this[attributeName] = attrs[key];
            }
        }
    };
    Model.prototype.isPersisted = function (val) {
        if (val != undefined) {
            this._persisted = val;
            this._originalAttributes = clonedeep_1.default(this.attributes);
            this._originalRelationships = this.relationshipResourceIdentifiers(Object.keys(this.relationships));
            return val;
        }
        else {
            return this._persisted;
        }
    };
    Model.prototype.isMarkedForDestruction = function (val) {
        if (val != undefined) {
            this._markedForDestruction = val;
            return val;
        }
        else {
            return this._markedForDestruction;
        }
    };
    Model.prototype.isMarkedForDisassociation = function (val) {
        if (val != undefined) {
            this._markedForDisassociation = val;
            return val;
        }
        else {
            return this._markedForDisassociation;
        }
    };
    Model.prototype.fromJsonapi = function (resource, payload, includeDirective) {
        if (includeDirective === void 0) { includeDirective = {}; }
        return deserialize_1.deserializeInstance(this, resource, payload, includeDirective);
    };
    Object.defineProperty(Model.prototype, "hasError", {
        get: function () {
            return Object.keys(this.errors).length > 1;
        },
        enumerable: true,
        configurable: true
    });
    Model.prototype.isDirty = function (relationships) {
        var dc = new dirty_check_1.default(this);
        return dc.check(relationships);
    };
    Model.prototype.changes = function () {
        var dc = new dirty_check_1.default(this);
        return dc.dirtyAttributes();
    };
    Model.prototype.hasDirtyRelation = function (relationName, relatedModel) {
        var dc = new dirty_check_1.default(this);
        return dc.checkRelation(relationName, relatedModel);
    };
    Model.prototype.dup = function () {
        return clonedeep_1.default(this);
    };
    Model.prototype.destroy = function () {
        var _this = this;
        var url = this.klass.url(this.id);
        var verb = 'delete';
        var request = new request_1.default();
        var requestPromise = request.delete(url, this._fetchOptions());
        return this._writeRequest(requestPromise, function () {
            _this.isPersisted(false);
        });
    };
    Model.prototype.save = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var url = this.klass.url();
        var verb = 'post';
        var request = new request_1.default();
        var payload = new write_payload_1.default(this, options['with']);
        if (this.isPersisted()) {
            url = this.klass.url(this.id);
            verb = 'put';
        }
        var json = payload.asJSON();
        var requestPromise = request[verb](url, json, this._fetchOptions());
        return this._writeRequest(requestPromise, function (response) {
            _this.fromJsonapi(response['jsonPayload'].data, response['jsonPayload'], payload.includeDirective);
            //this.isPersisted(true);
            payload.postProcess();
        });
    };
    // Define getter/setters and set defaults
    Model.prototype._initializeAttributes = function () {
        for (var key in this.klass.attributeList) {
            var attr = this.klass.attributeList[key];
            Object.defineProperty(this, attr.name, attr.descriptor());
            this[key] = this[key]; // set defaults
        }
    };
    Model.prototype._writeRequest = function (requestPromise, callback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            requestPromise.catch(function (e) { throw (e); });
            return requestPromise.then(function (response) {
                _this._handleResponse(response, resolve, reject, callback);
            });
        });
    };
    Model.prototype._handleResponse = function (response, resolve, reject, callback) {
        refresh_jwt_1.default(this.klass, response);
        if (response.status == 422) {
            validation_errors_1.default.apply(this, response['jsonPayload']);
            resolve(false);
        }
        else if (response.status >= 500) {
            reject('Server Error');
        }
        else {
            callback(response);
            resolve(true);
        }
    };
    Model.prototype._fetchOptions = function () {
        return this.klass.fetchOptions();
    };
    Model.baseUrl = 'http://please-set-a-base-url.com';
    Model.apiNamespace = '/';
    Model.jsonapiType = 'define-in-subclass';
    Model.isJWTOwner = false;
    Model.camelizeKeys = true;
    Model.attributeList = {};
    return Model;
}());
exports.default = Model;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kZWwvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxrQ0FBNkI7QUFDN0Isa0RBQXNDO0FBRXRDLG1EQUF1RTtBQUV2RSx5Q0FBcUM7QUFDckMseUNBQTBDO0FBQzFDLHVEQUFpRDtBQUVqRCxtREFBK0M7QUFDL0MsK0RBQXlEO0FBQ3pELG1EQUE2QztBQUM3Qyw2RUFBMEU7QUFDMUUsc0NBQWlDO0FBQ2pDLCtDQUEwQztBQUUxQztJQW1KRSxlQUFZLFVBQW1CO1FBdkkvQixnQkFBVyxHQUFXLEVBQUUsQ0FBQztRQUN6Qix3QkFBbUIsR0FBVyxFQUFFLENBQUM7UUFDakMsMkJBQXNCLEdBQVcsRUFBRSxDQUFDO1FBQ3BDLGtCQUFhLEdBQVcsRUFBRSxDQUFDO1FBQzNCLFdBQU0sR0FBVyxFQUFFLENBQUM7UUFDcEIsYUFBUSxHQUFrQixJQUFJLENBQUM7UUFDL0IsZUFBVSxHQUFZLEtBQUssQ0FBQztRQUM1QiwwQkFBcUIsR0FBWSxLQUFLLENBQUM7UUFDdkMsNkJBQXdCLEdBQVksS0FBSyxDQUFDO1FBZ0l4QyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsbUJBQW1CLEdBQUcsbUJBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO0lBQ3RHLENBQUM7SUE5SE0sWUFBTSxHQUFiLFVBQWMsR0FBUztRQUNyQixNQUFNLENBQUMsZ0JBQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVNLGVBQVMsR0FBaEIsVUFBaUIsUUFBYztR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