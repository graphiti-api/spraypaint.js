"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var validation_error_builder_1 = require("./util/validation-error-builder");
var refresh_jwt_1 = require("./util/refresh-jwt");
var relationship_identifiers_1 = require("./util/relationship-identifiers");
var request_1 = require("./request");
var write_payload_1 = require("./util/write-payload");
var enumerables_1 = require("./util/enumerables");
var credential_storage_1 = require("./credential-storage");
var id_map_1 = require("./id-map");
var deserialize_1 = require("./util/deserialize");
var dirty_check_1 = require("./util/dirty-check");
var scope_1 = require("./scope");
var jsonapi_type_registry_1 = require("./jsonapi-type-registry");
var inflected_1 = require("inflected");
var logger_1 = require("./logger");
var middleware_stack_1 = require("./middleware-stack");
var event_bus_1 = require("./event-bus");
var clonedeep_1 = require("./util/clonedeep");
var decorators_1 = require("./util/decorators");
exports.applyModelConfig = function (ModelClass, config) {
    var k;
    for (k in config) {
        if (config.hasOwnProperty(k)) {
            ModelClass[k] = config[k];
        }
    }
    if (ModelClass.isBaseClass === undefined) {
        ModelClass.setAsBase();
    }
    else if (ModelClass.isBaseClass === true) {
        ModelClass.isBaseClass = false;
    }
};
var JSORMBase = /** @class */ (function () {
    function JSORMBase(attrs) {
        this.stale = false;
        this.storeKey = "";
        this.relationships = {};
        this._persisted = false;
        this._markedForDestruction = false;
        this._markedForDisassociation = false;
        this._originalRelationships = {};
        this._errors = {};
        this._initializeAttributes();
        this.assignAttributes(attrs);
        this._originalAttributes = clonedeep_1.cloneDeep(this._attributes);
        this._originalRelationships = this.relationshipResourceIdentifiers(Object.keys(this.relationships));
    }
    Object.defineProperty(JSORMBase, "credentialStorage", {
        get: function () {
            if (!this._credentialStorage) {
                if (!this._credentialStorageBackend) {
                    if (this.jwtStorage && typeof localStorage !== "undefined") {
                        this._credentialStorageBackend = localStorage;
                    }
                    else {
                        this._credentialStorageBackend = new credential_storage_1.NullStorageBackend();
                    }
                }
                this._credentialStorage = new credential_storage_1.CredentialStorage(this.jwtStorage, this._credentialStorageBackend);
            }
            return this._credentialStorage;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JSORMBase, "credentialStorageBackend", {
        set: function (backend) {
            this._credentialStorageBackend = backend;
            this._credentialStorage = undefined;
        },
        enumerable: true,
        configurable: true
    });
    JSORMBase.fromJsonapi = function (resource, payload) {
        return deserialize_1.deserialize(this.typeRegistry, resource, payload);
    };
    JSORMBase.inherited = function (subclass) {
        subclass.parentClass = this;
        subclass.currentClass = subclass;
        subclass.prototype.klass = subclass;
        subclass.attributeList = clonedeep_1.cloneDeep(subclass.attributeList);
    };
    JSORMBase.setAsBase = function () {
        this.isBaseClass = true;
        this.jsonapiType = undefined;
        if (!this.typeRegistry) {
            this.typeRegistry = new jsonapi_type_registry_1.JsonapiTypeRegistry(this);
        }
        if (!this.middlewareStack) {
            this._middlewareStack = new middleware_stack_1.MiddlewareStack();
        }
        if (!this._IDMap) {
            this._IDMap = new id_map_1.IDMap();
        }
        var jwt = this.credentialStorage.getJWT();
        this.setJWT(jwt);
    };
    JSORMBase.isSubclassOf = function (maybeSuper) {
        var current = this.currentClass;
        while (current) {
            if (current === maybeSuper) {
                return true;
            }
            current = current.parentClass;
        }
        return false;
    };
    Object.defineProperty(JSORMBase, "baseClass", {
        get: function () {
            var current = this.currentClass;
            while (current) {
                if (current.isBaseClass) {
                    return current;
                }
                current = current.parentClass;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JSORMBase, "store", {
        get: function () {
            if (this.baseClass === undefined) {
                throw new Error("No base class for " + this.name);
            }
            return this.baseClass._IDMap;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JSORMBase, "typeRegistry", {
        get: function () {
            if (this.baseClass === undefined) {
                throw new Error("No base class for " + this.name);
            }
            return this.baseClass._typeRegistry;
        },
        set: function (registry) {
            if (!this.isBaseClass) {
                throw new Error("Cannot set a registry on a non-base class");
            }
            this._typeRegistry = registry;
        },
        enumerable: true,
        configurable: true
    });
    JSORMBase.registerType = function () {
        if (!this.jsonapiType) {
            return;
        }
        var existingType = this.typeRegistry.get(this.jsonapiType);
        if (existingType) {
            // Don't try to register a type of we're looking
            // at a subclass. Otherwise we'll make a register
            // call which will fail in order to get a helpful
            // error message from the registry
            if (this.isSubclassOf(existingType)) {
                return;
            }
        }
        this.typeRegistry.register(this.jsonapiType, this);
    };
    JSORMBase.extend = function (options) {
        var Subclass = /** @class */ (function (_super) {
            tslib_1.__extends(Subclass, _super);
            function Subclass() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return Subclass;
        }(this));
        this.inherited(Subclass);
        var attrs = {};
        if (options.attrs) {
            for (var key in options.attrs) {
                if (options.attrs.hasOwnProperty(key)) {
                    var attr = options.attrs[key];
                    if (!attr.name) {
                        attr.name = key;
                    }
                    attr.owner = Subclass;
                    attrs[key] = attr;
                }
            }
        }
        Subclass.attributeList = Object.assign({}, Subclass.attributeList, attrs);
        exports.applyModelConfig(Subclass, options.static || {});
        Subclass.registerType();
        if (options.methods) {
            for (var methodName in options.methods) {
                if (options.methods.hasOwnProperty(methodName)) {
                    ;
                    Subclass.prototype[methodName] = options.methods[methodName];
                }
            }
        }
        return Subclass;
    };
    JSORMBase.prototype._initializeAttributes = function () {
        this._attributes = {};
        this._copyPrototypeDescriptors();
    };
    /*
     * VueJS, along with a few other frameworks rely on objects being "reactive". In practice, this
     * means that when passing an object into an context where you would need change detection, vue
     * will inspect it for any enumerable properties that exist and might be depended on in templates
     * and other functions that will trigger changes.  In the case of vue, it intentionally avoids
     * resolving properties on the prototype chain and instead determines which it should override
     * using `Object.hasOwnProperty()`.  To get proper observability, we need to move all attribute
     * methods plus a few other utility getters to the object itself.
     */
    JSORMBase.prototype._copyPrototypeDescriptors = function () {
        var _this = this;
        var attrs = this.klass.attributeList;
        for (var key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                var attr = attrs[key];
                Object.defineProperty(this, key, attr.descriptor());
            }
        }
        ;
        [
            "errors",
            "isPersisted",
            "isMarkedForDestruction",
            "isMarkedForDisassociation"
        ].forEach(function (property) {
            var descriptor = Object.getOwnPropertyDescriptor(JSORMBase.prototype, property);
            if (descriptor) {
                Object.defineProperty(_this, property, descriptor);
            }
        });
    };
    JSORMBase.prototype.isType = function (jsonapiType) {
        return this.klass.jsonapiType === jsonapiType;
    };
    Object.defineProperty(JSORMBase.prototype, "isPersisted", {
        get: function () {
            return this._persisted;
        },
        set: function (val) {
            this._persisted = val;
            if (!!val)
                this.reset();
        },
        enumerable: true,
        configurable: true
    });
    JSORMBase.prototype.onStoreChange = function () {
        var _this = this;
        if (this._onStoreChange)
            return this._onStoreChange;
        this._onStoreChange = function (event, attrs) {
            var diff = {};
            Object.keys(attrs).forEach(function (k) {
                var self = _this;
                if (self[k] !== attrs[k]) {
                    diff[k] = [self[k], attrs[k]];
                    self[k] = attrs[k];
                }
            });
            var hasDiff = Object.keys(diff).length > 0;
            var hasAfterSync = typeof _this.afterSync !== "undefined";
            if (hasDiff && hasAfterSync)
                _this.afterSync(diff);
        };
        return this._onStoreChange;
    };
    JSORMBase.prototype.unlisten = function () {
        var _this = this;
        if (!this.klass.sync)
            return;
        if (this.storeKey) {
            event_bus_1.EventBus.removeEventListener(this.storeKey, this.onStoreChange());
        }
        Object.keys(this.relationships).forEach(function (k) {
            var related = _this.relationships[k];
            if (related) {
                if (Array.isArray(related)) {
                    related.forEach(function (r) { return r.unlisten(); });
                }
                else {
                    related.unlisten();
                }
            }
        });
    };
    JSORMBase.prototype.listen = function () {
        if (!this.klass.sync)
            return;
        if (!this._onStoreChange) {
            // not already registered
            event_bus_1.EventBus.addEventListener(this.storeKey, this.onStoreChange());
        }
    };
    JSORMBase.prototype.reset = function () {
        if (this.klass.sync) {
            this.klass.store.updateOrCreate(this);
            this.listen();
        }
        this._originalAttributes = clonedeep_1.cloneDeep(this._attributes);
        this._originalRelationships = this.relationshipResourceIdentifiers(Object.keys(this.relationships));
    };
    Object.defineProperty(JSORMBase.prototype, "isMarkedForDestruction", {
        get: function () {
            return this._markedForDestruction;
        },
        set: function (val) {
            this._markedForDestruction = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JSORMBase.prototype, "isMarkedForDisassociation", {
        get: function () {
            return this._markedForDisassociation;
        },
        set: function (val) {
            this._markedForDisassociation = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JSORMBase.prototype, "attributes", {
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
    Object.defineProperty(JSORMBase.prototype, "stored", {
        get: function () {
            return this.klass.store.find(this);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JSORMBase.prototype, "typedAttributes", {
        /*
         * This is a (hopefully) temporary method for typescript users.
         *
         * Currently the attributes() setter takes an arbitrary hash which
         * may or may not include valid attributes. In non-strict mode, it
         * silently drops those that it doesn't know. This is all perfectly fine
         * from a functionality point, but it means we can't correctly type
         * the attributes() getter return object, as it must match the setter's
         * type. I propose we change the type definition to require sending
         * abitrary hashes through the assignAttributes() method instead.
         */
        get: function () {
            return this._attributes;
        },
        enumerable: true,
        configurable: true
    });
    JSORMBase.prototype.relationship = function (name) {
        return this.relationships[name];
    };
    JSORMBase.prototype.assignAttributes = function (attrs) {
        if (!attrs) {
            return;
        }
        for (var key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                var attributeName = key;
                attributeName = this.klass.deserializeKey(key);
                if (key === "id" || this.klass.attributeList[attributeName]) {
                    ;
                    this[attributeName] = attrs[key];
                }
                else if (this.klass.strictAttributes) {
                    throw new Error("Unknown attribute: " + key);
                }
            }
        }
    };
    JSORMBase.prototype.setMeta = function (metaObj) {
        this.__meta__ = metaObj;
    };
    JSORMBase.prototype.relationshipResourceIdentifiers = function (relationNames) {
        return relationship_identifiers_1.default(this, relationNames);
    };
    JSORMBase.prototype.fromJsonapi = function (resource, payload, includeDirective) {
        if (includeDirective === void 0) { includeDirective = {}; }
        return deserialize_1.deserializeInstance(this, resource, payload, includeDirective);
    };
    Object.defineProperty(JSORMBase.prototype, "resourceIdentifier", {
        get: function () {
            if (this.klass.jsonapiType === undefined) {
                throw new Error("Cannot build resource identifier for class. No JSONAPI Type specified.");
            }
            return {
                id: this.id,
                type: this.klass.jsonapiType
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JSORMBase.prototype, "errors", {
        get: function () {
            return this._errors;
        },
        set: function (errs) {
            this._errors = errs;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JSORMBase.prototype, "hasError", {
        get: function () {
            return Object.keys(this._errors).length > 1;
        },
        enumerable: true,
        configurable: true
    });
    JSORMBase.prototype.clearErrors = function () {
        this.errors = {};
    };
    JSORMBase.prototype.isDirty = function (relationships) {
        var dc = new dirty_check_1.default(this);
        return dc.check(relationships);
    };
    JSORMBase.prototype.changes = function () {
        var dc = new dirty_check_1.default(this);
        return dc.dirtyAttributes();
    };
    JSORMBase.prototype.hasDirtyRelation = function (relationName, relatedModel) {
        var dc = new dirty_check_1.default(this);
        return dc.checkRelation(relationName, relatedModel);
    };
    JSORMBase.prototype.dup = function () {
        var nonEnums = enumerables_1.getNonEnumerables(this);
        enumerables_1.flipEnumerable(this, nonEnums, true);
        var cloned = clonedeep_1.cloneDeep(this);
        enumerables_1.flipEnumerable(this, nonEnums, false);
        enumerables_1.flipEnumerable(cloned, nonEnums, false);
        return cloned;
    };
    /*
     *
     * Model Persistence Methods
     *
     */
    JSORMBase.fetchOptions = function () {
        var options = {
            headers: (_a = {
                    Accept: "application/json"
                },
                _a["Content-Type"] = "application/json",
                _a)
        };
        var jwt = this.getJWT();
        if (jwt) {
            options.headers.Authorization = this.generateAuthHeader(jwt);
        }
        return options;
        var _a;
    };
    JSORMBase.url = function (id) {
        var endpoint = this.endpoint || "/" + this.jsonapiType;
        var base = "" + this.fullBasePath() + endpoint;
        if (id) {
            base = base + "/" + id;
        }
        return base;
    };
    JSORMBase.fullBasePath = function () {
        return "" + this.baseUrl + this.apiNamespace;
    };
    Object.defineProperty(JSORMBase, "middlewareStack", {
        get: function () {
            if (this.baseClass) {
                var stack = this.baseClass._middlewareStack;
                // Normally we want to use the middleware stack defined on the baseClass, but in the event
                // that our subclass has overridden one or the other, we create a middleware stack that
                // replaces the normal filters with the class override.
                if (this.beforeFetch || this.afterFetch) {
                    var before_1 = this.beforeFetch
                        ? [this.beforeFetch]
                        : stack.beforeFilters;
                    var after_1 = this.afterFetch ? [this.afterFetch] : stack.afterFilters;
                    return new middleware_stack_1.MiddlewareStack(before_1, after_1);
                }
                else {
                    return stack;
                }
            }
            else {
                // Shouldn't ever get here, as this should only happen on JSORMBase
                return new middleware_stack_1.MiddlewareStack();
            }
        },
        set: function (stack) {
            this._middlewareStack = stack;
        },
        enumerable: true,
        configurable: true
    });
    JSORMBase.scope = function () {
        return new scope_1.Scope(this);
    };
    JSORMBase.first = function () {
        return this.scope().first();
    };
    JSORMBase.all = function () {
        return this.scope().all();
    };
    JSORMBase.find = function (id) {
        return this.scope().find(id);
    };
    JSORMBase.where = function (clause) {
        return this.scope().where(clause);
    };
    JSORMBase.page = function (pageNum) {
        return this.scope().page(pageNum);
    };
    JSORMBase.per = function (size) {
        return this.scope().per(size);
    };
    JSORMBase.order = function (clause) {
        return this.scope().order(clause);
    };
    JSORMBase.select = function (clause) {
        return this.scope().select(clause);
    };
    JSORMBase.selectExtra = function (clause) {
        return this.scope().selectExtra(clause);
    };
    JSORMBase.stats = function (clause) {
        return this.scope().stats(clause);
    };
    JSORMBase.includes = function (clause) {
        return this.scope().includes(clause);
    };
    JSORMBase.merge = function (obj) {
        return this.scope().merge(obj);
    };
    JSORMBase.setJWT = function (token) {
        if (this.baseClass === undefined) {
            throw new Error("Cannot set JWT on " + this.name + ": No base class present.");
        }
        this.baseClass.jwt = token || undefined;
        this.credentialStorage.setJWT(token);
    };
    JSORMBase.getJWT = function () {
        var owner = this.baseClass;
        if (owner) {
            return owner.jwt;
        }
    };
    JSORMBase.generateAuthHeader = function (jwt) {
        return "Token token=\"" + jwt + "\"";
    };
    JSORMBase.getJWTOwner = function () {
        this.logger.warn("JSORMBase#getJWTOwner() is deprecated. Use #baseClass property instead");
        return this.baseClass;
    };
    JSORMBase.serializeKey = function (key) {
        switch (this.keyCase.server) {
            case "dash": {
                return inflected_1.dasherize(inflected_1.underscore(key));
            }
            case "snake": {
                return inflected_1.underscore(key);
            }
            case "camel": {
                return inflected_1.camelize(inflected_1.underscore(key), false);
            }
        }
    };
    JSORMBase.deserializeKey = function (key) {
        switch (this.keyCase.client) {
            case "dash": {
                return inflected_1.dasherize(inflected_1.underscore(key));
            }
            case "snake": {
                return inflected_1.underscore(key);
            }
            case "camel": {
                return inflected_1.camelize(inflected_1.underscore(key), false);
            }
        }
    };
    JSORMBase.prototype.destroy = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var url, verb, request, response, err_1, base;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.klass.url(this.id);
                        verb = "delete";
                        request = new request_1.Request(this._middleware(), this.klass.logger);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, request.delete(url, this._fetchOptions())];
                    case 2:
                        response = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        throw err_1;
                    case 4:
                        base = this.klass.baseClass;
                        base.store.destroy(this);
                        return [4 /*yield*/, this._handleResponse(response, function () {
                                _this.isPersisted = false;
                            })];
                    case 5: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    JSORMBase.prototype.save = function (options) {
        if (options === void 0) { options = {}; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var url, verb, request, payload, response, json, err_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.klass.url();
                        verb = "post";
                        request = new request_1.Request(this._middleware(), this.klass.logger);
                        payload = new write_payload_1.WritePayload(this, options.with);
                        if (this.isPersisted) {
                            url = this.klass.url(this.id);
                            verb = "patch";
                        }
                        this.clearErrors();
                        json = payload.asJSON();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, request[verb](url, json, this._fetchOptions())];
                    case 2:
                        response = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _a.sent();
                        throw err_2;
                    case 4: return [4 /*yield*/, this._handleResponse(response, function () {
                            _this.fromJsonapi(response.jsonPayload.data, response.jsonPayload, payload.includeDirective);
                            payload.postProcess();
                        })];
                    case 5: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    JSORMBase.prototype._handleResponse = function (response, callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                refresh_jwt_1.refreshJWT(this.klass, response);
                if (response.status === 422) {
                    validation_error_builder_1.ValidationErrorBuilder.apply(this, response.jsonPayload);
                    return [2 /*return*/, false];
                }
                else {
                    callback();
                    return [2 /*return*/, true];
                }
                return [2 /*return*/];
            });
        });
    };
    JSORMBase.prototype._fetchOptions = function () {
        return this.klass.fetchOptions();
    };
    JSORMBase.prototype._middleware = function () {
        return this.klass.middlewareStack;
    };
    // Todo:
    // * needs to recurse the directive
    // * remove the corresponding code from isPersisted and handle here (likely
    // only an issue with test setup)
    // * Make all calls go through resetRelationTracking();
    JSORMBase.prototype.resetRelationTracking = function (includeDirective) {
        this._originalRelationships = this.relationshipResourceIdentifiers(Object.keys(includeDirective));
    };
    JSORMBase.baseUrl = "http://please-set-a-base-url.com";
    JSORMBase.apiNamespace = "/";
    JSORMBase.keyCase = { server: "snake", client: "camel" };
    JSORMBase.strictAttributes = false;
    JSORMBase.logger = logger_1.logger;
    JSORMBase.sync = false;
    JSORMBase.attributeList = {};
    JSORMBase.currentClass = JSORMBase;
    JSORMBase.jwtStorage = "jwt";
    /*
     *
     * This is to allow for sane type checking in collaboration with the
     * isModelClass function exported below.  It is very hard to find out
     * whether something is a class of a certain type or subtype
     * (as opposed to an instance of that class), so we set a magic prop on
     * this for use around the codebase. For example, if you have a function:
     *
     * ``` typescript
     * function(arg : typeof JSORMBase | { foo : string }) {
     *   if(arg.isJSORMModel) {
     *     let modelClass : typeof JSORMBase = arg
     *   }
     * }
     * ```
     *
     */
    JSORMBase.isJSORMModel = true;
    tslib_1.__decorate([
        decorators_1.nonenumerable
    ], JSORMBase.prototype, "afterSync", void 0);
    tslib_1.__decorate([
        decorators_1.nonenumerable
    ], JSORMBase.prototype, "relationships", void 0);
    tslib_1.__decorate([
        decorators_1.nonenumerable
    ], JSORMBase.prototype, "klass", void 0);
    tslib_1.__decorate([
        decorators_1.nonenumerable
    ], JSORMBase.prototype, "_persisted", void 0);
    tslib_1.__decorate([
        decorators_1.nonenumerable
    ], JSORMBase.prototype, "_markedForDestruction", void 0);
    tslib_1.__decorate([
        decorators_1.nonenumerable
    ], JSORMBase.prototype, "_markedForDisassociation", void 0);
    tslib_1.__decorate([
        decorators_1.nonenumerable
    ], JSORMBase.prototype, "_originalRelationships", void 0);
    tslib_1.__decorate([
        decorators_1.nonenumerable
    ], JSORMBase.prototype, "_attributes", void 0);
    tslib_1.__decorate([
        decorators_1.nonenumerable
    ], JSORMBase.prototype, "_originalAttributes", void 0);
    tslib_1.__decorate([
        decorators_1.nonenumerable
    ], JSORMBase.prototype, "__meta__", void 0);
    tslib_1.__decorate([
        decorators_1.nonenumerable
    ], JSORMBase.prototype, "_errors", void 0);
    return JSORMBase;
}());
exports.JSORMBase = JSORMBase;
;
JSORMBase.prototype.klass = JSORMBase;
exports.isModelClass = function (arg) {
    if (!arg) {
        return false;
    }
    return arg.currentClass && arg.currentClass.isJSORMModel;
};
exports.isModelInstance = function (arg) {
    if (!arg) {
        return false;
    }
    return exports.isModelClass(arg.constructor.currentClass);
};
//# sourceMappingURL=model.js.map