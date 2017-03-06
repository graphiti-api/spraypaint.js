(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("jsorm", [], factory);
	else if(typeof exports === 'object')
		exports["jsorm"] = factory();
	else
		root["jsorm"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/// <reference path="../index.d.ts" />
	"use strict";
	// https://github.com/Microsoft/TypeScript/issues/6425
	global.__extends = (this && this.__extends) || function (d, b) {
	    for (var p in b)
	        if (b.hasOwnProperty(p))
	            d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    if (b.inherited)
	        b.inherited(d);
	};
	var configuration_1 = __webpack_require__(2);
	exports.Config = configuration_1.default;
	var model_1 = __webpack_require__(5);
	exports.Model = model_1.default;
	var attribute_1 = __webpack_require__(3);
	var associations_1 = __webpack_require__(20);
	exports.hasMany = associations_1.hasMany;
	exports.hasOne = associations_1.hasOne;
	exports.belongsTo = associations_1.belongsTo;
	var attr = function () {
	    return new attribute_1.default();
	};
	exports.attr = attr;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../index.d.ts" />
	"use strict";
	var attribute_1 = __webpack_require__(3);
	var logger_1 = __webpack_require__(4);
	var Config = (function () {
	    function Config() {
	    }
	    Config.setup = function (options) {
	        for (var _i = 0, _a = this.models; _i < _a.length; _i++) {
	            var model = _a[_i];
	            this.typeMapping[model.jsonapiType] = model;
	            if (options['jwtOwners'] && options['jwtOwners'].indexOf(model) !== -1) {
	                model.isJWTOwner = true;
	            }
	        }
	        for (var _b = 0, _c = this.models; _b < _c.length; _b++) {
	            var model = _c[_b];
	            attribute_1.default.applyAll(model);
	        }
	    };
	    Config.reset = function () {
	        this.typeMapping = {};
	        this.models = [];
	    };
	    Config.modelForType = function (type) {
	        var klass = this.typeMapping[type];
	        if (klass) {
	            return klass;
	        }
	        else {
	            throw ("Could not find class for jsonapi type \"" + type + "\"");
	        }
	    };
	    return Config;
	}());
	Config.models = [];
	Config.typeMapping = {};
	Config.logger = new logger_1.default();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Config;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	// In the future, this class will be used for
	// transforms, default values, etc.
	"use strict";
	var configuration_1 = __webpack_require__(2);
	var Attribute = (function () {
	    function Attribute() {
	        this.isAttr = true;
	    }
	    Attribute.applyAll = function (klass) {
	        this._eachAttribute(klass, function (attr) {
	            klass.attributeList.push(attr.name);
	            Object.defineProperty(klass.prototype, attr.name, attr.getSet());
	        });
	    };
	    Attribute._eachAttribute = function (klass, callback) {
	        var instance = new klass();
	        for (var propName in instance) {
	            if (instance[propName] && instance[propName].hasOwnProperty('isAttr')) {
	                var attrInstance = instance[propName];
	                attrInstance.name = propName;
	                if (attrInstance.isRelationship) {
	                    attrInstance.klass = configuration_1.default.modelForType(attrInstance.jsonapiType || attrInstance.name);
	                }
	                callback(attrInstance);
	            }
	        }
	    };
	    // This returns the getters/setters for use on the *model*
	    Attribute.prototype.getSet = function () {
	        var attr = this;
	        return {
	            get: function () {
	                return attr.getter(this);
	            },
	            set: function (value) {
	                if (!value || !value.hasOwnProperty('isAttr')) {
	                    attr.setter(this, value);
	                }
	            }
	        };
	    };
	    // The model calls this setter
	    Attribute.prototype.setter = function (context, val) {
	        context.attributes[this.name] = val;
	    };
	    // The model calls this getter
	    Attribute.prototype.getter = function (context) {
	        return context.attributes[this.name];
	    };
	    return Attribute;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Attribute;


/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	var Logger = (function () {
	    function Logger() {
	        this._level = 2;
	        this.LEVELS = {
	            debug: 1,
	            info: 2,
	            warn: 3,
	            error: 4
	        };
	    }
	    Object.defineProperty(Logger.prototype, "level", {
	        get: function () {
	            for (var key in this.LEVELS) {
	                var val = this.LEVELS[key];
	                if (val === this._level)
	                    return key;
	            }
	        },
	        set: function (value) {
	            var lvlValue = this.LEVELS[value];
	            if (lvlValue) {
	                this._level = lvlValue;
	            }
	            else {
	                throw ("Log level must be one of " + Object.keys(this.LEVELS).join(', '));
	            }
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Logger.prototype.debug = function (stmt) {
	        if (this._level <= this.LEVELS.debug) {
	            console.debug(stmt);
	        }
	    };
	    Logger.prototype.info = function (stmt) {
	        if (this._level <= this.LEVELS.info) {
	            console.info(stmt);
	        }
	    };
	    Logger.prototype.warn = function (stmt) {
	        if (this._level <= this.LEVELS.warn) {
	            console.warn(stmt);
	        }
	    };
	    Logger.prototype.error = function (stmt) {
	        if (this._level <= this.LEVELS.warn) {
	            console.error(stmt);
	        }
	    };
	    return Logger;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Logger;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/// <reference path="../index.d.ts" />
	"use strict";
	var scope_1 = __webpack_require__(7);
	var configuration_1 = __webpack_require__(2);
	var deserialize_1 = __webpack_require__(17);
	var extend_1 = __webpack_require__(19);
	var string_1 = __webpack_require__(18);
	var Model = (function () {
	    function Model(attributes) {
	        this._attributes = {};
	        this.relationships = {};
	        this.__meta__ = null;
	        this.attributes = attributes;
	    }
	    Model.extend = function (obj) {
	        return extend_1.default(this, obj);
	    };
	    Model.inherited = function (subclass) {
	        configuration_1.default.models.push(subclass);
	        subclass.parentClass = this;
	        subclass.prototype.klass = subclass;
	    };
	    Model.scope = function () {
	        return this._scope || new scope_1.default(this);
	    };
	    Model.setJWT = function (token) {
	        this.getJWTOwner().jwt = token;
	    };
	    Model.getJWT = function () {
	        return this.getJWTOwner().jwt;
	    };
	    Model.getJWTOwner = function () {
	        if (this.isJWTOwner) {
	            return this;
	        }
	        else {
	            return this.parentClass.getJWTOwner();
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
	        var base = "" + this.baseUrl + this.apiNamespace + endpoint;
	        if (id) {
	            base = base + "/" + id;
	        }
	        return base;
	    };
	    Model.fromJsonapi = function (resource, payload) {
	        return deserialize_1.default(resource, payload);
	    };
	    Object.defineProperty(Model.prototype, "attributes", {
	        get: function () {
	            return this._attributes;
	        },
	        set: function (attrs) {
	            for (var key in attrs) {
	                var attributeName = string_1.camelize(key);
	                if (key == 'id' || this.klass.attributeList.indexOf(attributeName) >= 0) {
	                    this[attributeName] = attrs[key];
	                }
	            }
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Model.prototype.isType = function (jsonapiType) {
	        return this.klass.jsonapiType === jsonapiType;
	    };
	    return Model;
	}());
	Model.baseUrl = process.env.BROWSER ? '' : 'http://localhost:9999';
	Model.apiNamespace = '/';
	Model.jsonapiType = 'define-in-subclass';
	Model.isJWTOwner = false;
	Model.jwt = null;
	Model.attributeList = [];
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Model;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

/***/ },
/* 6 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var parameterize_1 = __webpack_require__(8);
	var include_directive_1 = __webpack_require__(9);
	var proxies_1 = __webpack_require__(10);
	var request_1 = __webpack_require__(13);
	var cloneDeep = __webpack_require__(15);
	var Scope = (function () {
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
	    // TODO: paginate 1
	    Scope.prototype.first = function () {
	        return this.per(1).all().then(function (models) {
	            return models.data[0];
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
	        var newScope = cloneDeep(this);
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
	        var jwt = this.model.getJWT();
	        return request.get(url, { jwt: jwt }).then(function (response) {
	            var jwtHeader = response.headers.get('X-JWT');
	            if (jwtHeader) {
	                _this.model.setJWT(jwtHeader);
	            }
	            return response.json;
	        });
	    };
	    return Scope;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Scope;


/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";
	function parameterize(obj, prefix) {
	    var str = [];
	    for (var key in obj) {
	        var value = obj[key];
	        if (!!value) {
	            if (prefix) {
	                key = prefix + "[" + key + "]";
	            }
	            if (Array.isArray(value)) {
	                if (value.length > 0) {
	                    str.push(key + "=" + value.join(','));
	                }
	            }
	            else if (typeof value == "object") {
	                str.push(parameterize(value, key));
	            }
	            else {
	                str.push(key + "=" + value);
	            }
	        }
	    }
	    // remove blanks
	    str = str.filter(function (p) {
	        return !!p;
	    });
	    return str.join("&");
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = parameterize;


/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";
	var IncludeDirective = (function () {
	    function IncludeDirective(obj) {
	        this.dct = {};
	        var includeHash = this.parseIncludeArgs(obj);
	        for (var key in includeHash) {
	            this.dct[key] = new IncludeDirective(includeHash[key]);
	        }
	    }
	    IncludeDirective.prototype.toObject = function () {
	        var hash = {};
	        for (var key in this.dct) {
	            hash[key] = this.dct[key].toObject();
	        }
	        return hash;
	    };
	    IncludeDirective.prototype.toString = function () {
	        var stringArray = [];
	        var _loop_1 = function (key) {
	            var stringValue = this_1.dct[key].toString();
	            if (stringValue === '') {
	                stringArray.push(key);
	            }
	            else {
	                stringValue = stringValue.split(',');
	                stringValue = stringValue.map(function (x) { return key + "." + x; });
	                stringArray.push(stringValue.join(','));
	            }
	        };
	        var this_1 = this;
	        for (var key in this.dct) {
	            _loop_1(key);
	        }
	        return stringArray.join(',');
	    };
	    IncludeDirective.prototype.parseIncludeArgs = function (includeArgs) {
	        if (Array.isArray(includeArgs)) {
	            return this._parseArray(includeArgs);
	        }
	        else if (typeof includeArgs == "string") {
	            var obj = {};
	            obj[includeArgs] = {};
	            return obj;
	        }
	        else if (typeof includeArgs == "object") {
	            return this._parseObject(includeArgs);
	        }
	        else {
	            return {};
	        }
	    };
	    // private
	    IncludeDirective.prototype._parseObject = function (includeObj) {
	        var parsed = {};
	        for (var key in includeObj) {
	            parsed[key] = this.parseIncludeArgs(includeObj[key]);
	        }
	        return parsed;
	    };
	    IncludeDirective.prototype._parseArray = function (includeArray) {
	        var parsed = {};
	        for (var _i = 0, includeArray_1 = includeArray; _i < includeArray_1.length; _i++) {
	            var value = includeArray_1[_i];
	            var parsedEl = this.parseIncludeArgs(value);
	            for (var key in parsedEl) {
	                parsed[key] = parsedEl[key];
	            }
	        }
	        return parsed;
	    };
	    return IncludeDirective;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = IncludeDirective;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var collection_proxy_1 = __webpack_require__(11);
	exports.CollectionProxy = collection_proxy_1.default;
	var record_proxy_1 = __webpack_require__(12);
	exports.RecordProxy = record_proxy_1.default;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var model_1 = __webpack_require__(5);
	var CollectionProxy = (function () {
	    function CollectionProxy(raw_json) {
	        if (raw_json === void 0) { raw_json = { data: [] }; }
	        var _this = this;
	        this.setRaw = function (json_payload) {
	            _this._raw_json = json_payload;
	            _this._array = [];
	            _this.raw.data.map(function (datum) {
	                _this._array.push(model_1.default.fromJsonapi(datum, _this.raw));
	            });
	        };
	        this.setRaw(raw_json);
	    }
	    Object.defineProperty(CollectionProxy.prototype, "raw", {
	        get: function () {
	            return this._raw_json;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(CollectionProxy.prototype, "data", {
	        get: function () {
	            return this._array;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(CollectionProxy.prototype, "meta", {
	        get: function () {
	            return this.raw.meta || {};
	        },
	        enumerable: true,
	        configurable: true
	    });
	    return CollectionProxy;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = CollectionProxy;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var model_1 = __webpack_require__(5);
	var RecordProxy = (function () {
	    function RecordProxy(raw_json) {
	        if (raw_json === void 0) { raw_json = { data: [] }; }
	        var _this = this;
	        this.setRaw = function (json_payload) {
	            _this._raw_json = json_payload;
	            if (_this.raw.data) {
	                _this._model = model_1.default.fromJsonapi(_this.raw.data, _this.raw);
	            }
	            else {
	                _this._model = null;
	            }
	        };
	        this.setRaw(raw_json);
	    }
	    Object.defineProperty(RecordProxy.prototype, "raw", {
	        get: function () {
	            return this._raw_json;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(RecordProxy.prototype, "data", {
	        get: function () {
	            return this._model;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(RecordProxy.prototype, "meta", {
	        get: function () {
	            return this.raw.meta || {};
	        },
	        enumerable: true,
	        configurable: true
	    });
	    return RecordProxy;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = RecordProxy;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var configuration_1 = __webpack_require__(2);
	var colorize_1 = __webpack_require__(14);
	var Request = (function () {
	    function Request() {
	    }
	    Request.prototype.get = function (url, options) {
	        var _this = this;
	        configuration_1.default.logger.info(colorize_1.default('cyan', 'GET: ') + colorize_1.default('magenta', url));
	        return new Promise(function (resolve, reject) {
	            var headers = _this.buildHeaders(options);
	            fetch(url, { headers: headers }).then(function (response) {
	                response.json().then(function (json) {
	                    configuration_1.default.logger.debug(colorize_1.default('bold', JSON.stringify(json, null, 4)));
	                    resolve({ json: json, headers: response.headers });
	                });
	            });
	        });
	    };
	    Request.prototype.buildHeaders = function (options) {
	        var headers = {};
	        if (options['jwt']) {
	            headers['Authorization'] = "Token token=\"" + options['jwt'] + "\"";
	        }
	        return headers;
	    };
	    return Request;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Request;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {"use strict";
	var COLORS = {
	    green: [32, 39],
	    cyan: [36, 39],
	    magenta: [35, 39],
	    bold: [1, 22],
	};
	function colorize(color, text) {
	    if (supportsColor()) {
	        var map = COLORS[color];
	        return "\u001B[" + map[0] + "m" + text + "\u001B[" + map[1] + "m";
	    }
	    else {
	        return text;
	    }
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = colorize;
	function supportsColor() {
	    if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) {
	        return true;
	    }
	    else {
	        return false;
	    }
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, module) {/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */
	
	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;
	
	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';
	
	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    promiseTag = '[object Promise]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    symbolTag = '[object Symbol]',
	    weakMapTag = '[object WeakMap]';
	
	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';
	
	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
	
	/** Used to match `RegExp` flags from their coerced string values. */
	var reFlags = /\w*$/;
	
	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;
	
	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;
	
	/** Used to identify `toStringTag` values supported by `_.clone`. */
	var cloneableTags = {};
	cloneableTags[argsTag] = cloneableTags[arrayTag] =
	cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
	cloneableTags[boolTag] = cloneableTags[dateTag] =
	cloneableTags[float32Tag] = cloneableTags[float64Tag] =
	cloneableTags[int8Tag] = cloneableTags[int16Tag] =
	cloneableTags[int32Tag] = cloneableTags[mapTag] =
	cloneableTags[numberTag] = cloneableTags[objectTag] =
	cloneableTags[regexpTag] = cloneableTags[setTag] =
	cloneableTags[stringTag] = cloneableTags[symbolTag] =
	cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
	cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
	cloneableTags[errorTag] = cloneableTags[funcTag] =
	cloneableTags[weakMapTag] = false;
	
	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
	
	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
	
	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();
	
	/** Detect free variable `exports`. */
	var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;
	
	/** Detect free variable `module`. */
	var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
	
	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;
	
	/**
	 * Adds the key-value `pair` to `map`.
	 *
	 * @private
	 * @param {Object} map The map to modify.
	 * @param {Array} pair The key-value pair to add.
	 * @returns {Object} Returns `map`.
	 */
	function addMapEntry(map, pair) {
	  // Don't return `map.set` because it's not chainable in IE 11.
	  map.set(pair[0], pair[1]);
	  return map;
	}
	
	/**
	 * Adds `value` to `set`.
	 *
	 * @private
	 * @param {Object} set The set to modify.
	 * @param {*} value The value to add.
	 * @returns {Object} Returns `set`.
	 */
	function addSetEntry(set, value) {
	  // Don't return `set.add` because it's not chainable in IE 11.
	  set.add(value);
	  return set;
	}
	
	/**
	 * A specialized version of `_.forEach` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns `array`.
	 */
	function arrayEach(array, iteratee) {
	  var index = -1,
	      length = array ? array.length : 0;
	
	  while (++index < length) {
	    if (iteratee(array[index], index, array) === false) {
	      break;
	    }
	  }
	  return array;
	}
	
	/**
	 * Appends the elements of `values` to `array`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to append.
	 * @returns {Array} Returns `array`.
	 */
	function arrayPush(array, values) {
	  var index = -1,
	      length = values.length,
	      offset = array.length;
	
	  while (++index < length) {
	    array[offset + index] = values[index];
	  }
	  return array;
	}
	
	/**
	 * A specialized version of `_.reduce` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {*} [accumulator] The initial value.
	 * @param {boolean} [initAccum] Specify using the first element of `array` as
	 *  the initial value.
	 * @returns {*} Returns the accumulated value.
	 */
	function arrayReduce(array, iteratee, accumulator, initAccum) {
	  var index = -1,
	      length = array ? array.length : 0;
	
	  if (initAccum && length) {
	    accumulator = array[++index];
	  }
	  while (++index < length) {
	    accumulator = iteratee(accumulator, array[index], index, array);
	  }
	  return accumulator;
	}
	
	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */
	function baseTimes(n, iteratee) {
	  var index = -1,
	      result = Array(n);
	
	  while (++index < n) {
	    result[index] = iteratee(index);
	  }
	  return result;
	}
	
	/**
	 * Gets the value at `key` of `object`.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */
	function getValue(object, key) {
	  return object == null ? undefined : object[key];
	}
	
	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}
	
	/**
	 * Converts `map` to its key-value pairs.
	 *
	 * @private
	 * @param {Object} map The map to convert.
	 * @returns {Array} Returns the key-value pairs.
	 */
	function mapToArray(map) {
	  var index = -1,
	      result = Array(map.size);
	
	  map.forEach(function(value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}
	
	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg(func, transform) {
	  return function(arg) {
	    return func(transform(arg));
	  };
	}
	
	/**
	 * Converts `set` to an array of its values.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the values.
	 */
	function setToArray(set) {
	  var index = -1,
	      result = Array(set.size);
	
	  set.forEach(function(value) {
	    result[++index] = value;
	  });
	  return result;
	}
	
	/** Used for built-in method references. */
	var arrayProto = Array.prototype,
	    funcProto = Function.prototype,
	    objectProto = Object.prototype;
	
	/** Used to detect overreaching core-js shims. */
	var coreJsData = root['__core-js_shared__'];
	
	/** Used to detect methods masquerading as native. */
	var maskSrcKey = (function() {
	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
	  return uid ? ('Symbol(src)_1.' + uid) : '';
	}());
	
	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);
	
	/** Built-in value references. */
	var Buffer = moduleExports ? root.Buffer : undefined,
	    Symbol = root.Symbol,
	    Uint8Array = root.Uint8Array,
	    getPrototype = overArg(Object.getPrototypeOf, Object),
	    objectCreate = Object.create,
	    propertyIsEnumerable = objectProto.propertyIsEnumerable,
	    splice = arrayProto.splice;
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetSymbols = Object.getOwnPropertySymbols,
	    nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
	    nativeKeys = overArg(Object.keys, Object);
	
	/* Built-in method references that are verified to be native. */
	var DataView = getNative(root, 'DataView'),
	    Map = getNative(root, 'Map'),
	    Promise = getNative(root, 'Promise'),
	    Set = getNative(root, 'Set'),
	    WeakMap = getNative(root, 'WeakMap'),
	    nativeCreate = getNative(Object, 'create');
	
	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = toSource(DataView),
	    mapCtorString = toSource(Map),
	    promiseCtorString = toSource(Promise),
	    setCtorString = toSource(Set),
	    weakMapCtorString = toSource(WeakMap);
	
	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
	
	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Hash(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear() {
	  this.__data__ = nativeCreate ? nativeCreate(null) : {};
	}
	
	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @name delete
	 * @memberOf Hash
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function hashDelete(key) {
	  return this.has(key) && delete this.__data__[key];
	}
	
	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Hash
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function hashGet(key) {
	  var data = this.__data__;
	  if (nativeCreate) {
	    var result = data[key];
	    return result === HASH_UNDEFINED ? undefined : result;
	  }
	  return hasOwnProperty.call(data, key) ? data[key] : undefined;
	}
	
	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Hash
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function hashHas(key) {
	  var data = this.__data__;
	  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
	}
	
	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Hash
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the hash instance.
	 */
	function hashSet(key, value) {
	  var data = this.__data__;
	  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
	  return this;
	}
	
	// Add methods to `Hash`.
	Hash.prototype.clear = hashClear;
	Hash.prototype['delete'] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;
	
	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */
	function listCacheClear() {
	  this.__data__ = [];
	}
	
	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function listCacheDelete(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = data.length - 1;
	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice.call(data, index, 1);
	  }
	  return true;
	}
	
	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function listCacheGet(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  return index < 0 ? undefined : data[index][1];
	}
	
	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function listCacheHas(key) {
	  return assocIndexOf(this.__data__, key) > -1;
	}
	
	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */
	function listCacheSet(key, value) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  if (index < 0) {
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}
	
	// Add methods to `ListCache`.
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;
	
	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function MapCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapCacheClear() {
	  this.__data__ = {
	    'hash': new Hash,
	    'map': new (Map || ListCache),
	    'string': new Hash
	  };
	}
	
	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function mapCacheDelete(key) {
	  return getMapData(this, key)['delete'](key);
	}
	
	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function mapCacheGet(key) {
	  return getMapData(this, key).get(key);
	}
	
	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function mapCacheHas(key) {
	  return getMapData(this, key).has(key);
	}
	
	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache instance.
	 */
	function mapCacheSet(key, value) {
	  getMapData(this, key).set(key, value);
	  return this;
	}
	
	// Add methods to `MapCache`.
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype['delete'] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;
	
	/**
	 * Creates a stack cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Stack(entries) {
	  this.__data__ = new ListCache(entries);
	}
	
	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */
	function stackClear() {
	  this.__data__ = new ListCache;
	}
	
	/**
	 * Removes `key` and its value from the stack.
	 *
	 * @private
	 * @name delete
	 * @memberOf Stack
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function stackDelete(key) {
	  return this.__data__['delete'](key);
	}
	
	/**
	 * Gets the stack value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Stack
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function stackGet(key) {
	  return this.__data__.get(key);
	}
	
	/**
	 * Checks if a stack value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Stack
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function stackHas(key) {
	  return this.__data__.has(key);
	}
	
	/**
	 * Sets the stack `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Stack
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the stack cache instance.
	 */
	function stackSet(key, value) {
	  var cache = this.__data__;
	  if (cache instanceof ListCache) {
	    var pairs = cache.__data__;
	    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
	      pairs.push([key, value]);
	      return this;
	    }
	    cache = this.__data__ = new MapCache(pairs);
	  }
	  cache.set(key, value);
	  return this;
	}
	
	// Add methods to `Stack`.
	Stack.prototype.clear = stackClear;
	Stack.prototype['delete'] = stackDelete;
	Stack.prototype.get = stackGet;
	Stack.prototype.has = stackHas;
	Stack.prototype.set = stackSet;
	
	/**
	 * Creates an array of the enumerable property names of the array-like `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @param {boolean} inherited Specify returning inherited property names.
	 * @returns {Array} Returns the array of property names.
	 */
	function arrayLikeKeys(value, inherited) {
	  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
	  // Safari 9 makes `arguments.length` enumerable in strict mode.
	  var result = (isArray(value) || isArguments(value))
	    ? baseTimes(value.length, String)
	    : [];
	
	  var length = result.length,
	      skipIndexes = !!length;
	
	  for (var key in value) {
	    if ((inherited || hasOwnProperty.call(value, key)) &&
	        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	/**
	 * Assigns `value` to `key` of `object` if the existing value is not equivalent
	 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function assignValue(object, key, value) {
	  var objValue = object[key];
	  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
	      (value === undefined && !(key in object))) {
	    object[key] = value;
	  }
	}
	
	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}
	
	/**
	 * The base implementation of `_.assign` without support for multiple sources
	 * or `customizer` functions.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @returns {Object} Returns `object`.
	 */
	function baseAssign(object, source) {
	  return object && copyObject(source, keys(source), object);
	}
	
	/**
	 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
	 * traversed objects.
	 *
	 * @private
	 * @param {*} value The value to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @param {boolean} [isFull] Specify a clone including symbols.
	 * @param {Function} [customizer] The function to customize cloning.
	 * @param {string} [key] The key of `value`.
	 * @param {Object} [object] The parent object of `value`.
	 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
	 * @returns {*} Returns the cloned value.
	 */
	function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
	  var result;
	  if (customizer) {
	    result = object ? customizer(value, key, object, stack) : customizer(value);
	  }
	  if (result !== undefined) {
	    return result;
	  }
	  if (!isObject(value)) {
	    return value;
	  }
	  var isArr = isArray(value);
	  if (isArr) {
	    result = initCloneArray(value);
	    if (!isDeep) {
	      return copyArray(value, result);
	    }
	  } else {
	    var tag = getTag(value),
	        isFunc = tag == funcTag || tag == genTag;
	
	    if (isBuffer(value)) {
	      return cloneBuffer(value, isDeep);
	    }
	    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
	      if (isHostObject(value)) {
	        return object ? value : {};
	      }
	      result = initCloneObject(isFunc ? {} : value);
	      if (!isDeep) {
	        return copySymbols(value, baseAssign(result, value));
	      }
	    } else {
	      if (!cloneableTags[tag]) {
	        return object ? value : {};
	      }
	      result = initCloneByTag(value, tag, baseClone, isDeep);
	    }
	  }
	  // Check for circular references and return its corresponding clone.
	  stack || (stack = new Stack);
	  var stacked = stack.get(value);
	  if (stacked) {
	    return stacked;
	  }
	  stack.set(value, result);
	
	  if (!isArr) {
	    var props = isFull ? getAllKeys(value) : keys(value);
	  }
	  arrayEach(props || value, function(subValue, key) {
	    if (props) {
	      key = subValue;
	      subValue = value[key];
	    }
	    // Recursively populate clone (susceptible to call stack limits).
	    assignValue(result, key, baseClone(subValue, isDeep, isFull, customizer, key, value, stack));
	  });
	  return result;
	}
	
	/**
	 * The base implementation of `_.create` without support for assigning
	 * properties to the created object.
	 *
	 * @private
	 * @param {Object} prototype The object to inherit from.
	 * @returns {Object} Returns the new object.
	 */
	function baseCreate(proto) {
	  return isObject(proto) ? objectCreate(proto) : {};
	}
	
	/**
	 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
	 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
	 * symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @param {Function} symbolsFunc The function to get the symbols of `object`.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function baseGetAllKeys(object, keysFunc, symbolsFunc) {
	  var result = keysFunc(object);
	  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
	}
	
	/**
	 * The base implementation of `getTag`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function baseGetTag(value) {
	  return objectToString.call(value);
	}
	
	/**
	 * The base implementation of `_.isNative` without bad shim checks.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 */
	function baseIsNative(value) {
	  if (!isObject(value) || isMasked(value)) {
	    return false;
	  }
	  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource(value));
	}
	
	/**
	 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys(object) {
	  if (!isPrototype(object)) {
	    return nativeKeys(object);
	  }
	  var result = [];
	  for (var key in Object(object)) {
	    if (hasOwnProperty.call(object, key) && key != 'constructor') {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	/**
	 * Creates a clone of  `buffer`.
	 *
	 * @private
	 * @param {Buffer} buffer The buffer to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Buffer} Returns the cloned buffer.
	 */
	function cloneBuffer(buffer, isDeep) {
	  if (isDeep) {
	    return buffer.slice();
	  }
	  var result = new buffer.constructor(buffer.length);
	  buffer.copy(result);
	  return result;
	}
	
	/**
	 * Creates a clone of `arrayBuffer`.
	 *
	 * @private
	 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
	 * @returns {ArrayBuffer} Returns the cloned array buffer.
	 */
	function cloneArrayBuffer(arrayBuffer) {
	  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
	  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
	  return result;
	}
	
	/**
	 * Creates a clone of `dataView`.
	 *
	 * @private
	 * @param {Object} dataView The data view to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the cloned data view.
	 */
	function cloneDataView(dataView, isDeep) {
	  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
	  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
	}
	
	/**
	 * Creates a clone of `map`.
	 *
	 * @private
	 * @param {Object} map The map to clone.
	 * @param {Function} cloneFunc The function to clone values.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the cloned map.
	 */
	function cloneMap(map, isDeep, cloneFunc) {
	  var array = isDeep ? cloneFunc(mapToArray(map), true) : mapToArray(map);
	  return arrayReduce(array, addMapEntry, new map.constructor);
	}
	
	/**
	 * Creates a clone of `regexp`.
	 *
	 * @private
	 * @param {Object} regexp The regexp to clone.
	 * @returns {Object} Returns the cloned regexp.
	 */
	function cloneRegExp(regexp) {
	  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
	  result.lastIndex = regexp.lastIndex;
	  return result;
	}
	
	/**
	 * Creates a clone of `set`.
	 *
	 * @private
	 * @param {Object} set The set to clone.
	 * @param {Function} cloneFunc The function to clone values.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the cloned set.
	 */
	function cloneSet(set, isDeep, cloneFunc) {
	  var array = isDeep ? cloneFunc(setToArray(set), true) : setToArray(set);
	  return arrayReduce(array, addSetEntry, new set.constructor);
	}
	
	/**
	 * Creates a clone of the `symbol` object.
	 *
	 * @private
	 * @param {Object} symbol The symbol object to clone.
	 * @returns {Object} Returns the cloned symbol object.
	 */
	function cloneSymbol(symbol) {
	  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
	}
	
	/**
	 * Creates a clone of `typedArray`.
	 *
	 * @private
	 * @param {Object} typedArray The typed array to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the cloned typed array.
	 */
	function cloneTypedArray(typedArray, isDeep) {
	  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
	  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
	}
	
	/**
	 * Copies the values of `source` to `array`.
	 *
	 * @private
	 * @param {Array} source The array to copy values from.
	 * @param {Array} [array=[]] The array to copy values to.
	 * @returns {Array} Returns `array`.
	 */
	function copyArray(source, array) {
	  var index = -1,
	      length = source.length;
	
	  array || (array = Array(length));
	  while (++index < length) {
	    array[index] = source[index];
	  }
	  return array;
	}
	
	/**
	 * Copies properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy properties from.
	 * @param {Array} props The property identifiers to copy.
	 * @param {Object} [object={}] The object to copy properties to.
	 * @param {Function} [customizer] The function to customize copied values.
	 * @returns {Object} Returns `object`.
	 */
	function copyObject(source, props, object, customizer) {
	  object || (object = {});
	
	  var index = -1,
	      length = props.length;
	
	  while (++index < length) {
	    var key = props[index];
	
	    var newValue = customizer
	      ? customizer(object[key], source[key], key, object, source)
	      : undefined;
	
	    assignValue(object, key, newValue === undefined ? source[key] : newValue);
	  }
	  return object;
	}
	
	/**
	 * Copies own symbol properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy symbols from.
	 * @param {Object} [object={}] The object to copy symbols to.
	 * @returns {Object} Returns `object`.
	 */
	function copySymbols(source, object) {
	  return copyObject(source, getSymbols(source), object);
	}
	
	/**
	 * Creates an array of own enumerable property names and symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function getAllKeys(object) {
	  return baseGetAllKeys(object, keys, getSymbols);
	}
	
	/**
	 * Gets the data for `map`.
	 *
	 * @private
	 * @param {Object} map The map to query.
	 * @param {string} key The reference key.
	 * @returns {*} Returns the map data.
	 */
	function getMapData(map, key) {
	  var data = map.__data__;
	  return isKeyable(key)
	    ? data[typeof key == 'string' ? 'string' : 'hash']
	    : data.map;
	}
	
	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = getValue(object, key);
	  return baseIsNative(value) ? value : undefined;
	}
	
	/**
	 * Creates an array of the own enumerable symbol properties of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;
	
	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	var getTag = baseGetTag;
	
	// Fallback for data views, maps, sets, and weak maps in IE 11,
	// for data views in Edge < 14, and promises in Node.js.
	if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
	    (Map && getTag(new Map) != mapTag) ||
	    (Promise && getTag(Promise.resolve()) != promiseTag) ||
	    (Set && getTag(new Set) != setTag) ||
	    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
	  getTag = function(value) {
	    var result = objectToString.call(value),
	        Ctor = result == objectTag ? value.constructor : undefined,
	        ctorString = Ctor ? toSource(Ctor) : undefined;
	
	    if (ctorString) {
	      switch (ctorString) {
	        case dataViewCtorString: return dataViewTag;
	        case mapCtorString: return mapTag;
	        case promiseCtorString: return promiseTag;
	        case setCtorString: return setTag;
	        case weakMapCtorString: return weakMapTag;
	      }
	    }
	    return result;
	  };
	}
	
	/**
	 * Initializes an array clone.
	 *
	 * @private
	 * @param {Array} array The array to clone.
	 * @returns {Array} Returns the initialized clone.
	 */
	function initCloneArray(array) {
	  var length = array.length,
	      result = array.constructor(length);
	
	  // Add properties assigned by `RegExp#exec`.
	  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
	    result.index = array.index;
	    result.input = array.input;
	  }
	  return result;
	}
	
	/**
	 * Initializes an object clone.
	 *
	 * @private
	 * @param {Object} object The object to clone.
	 * @returns {Object} Returns the initialized clone.
	 */
	function initCloneObject(object) {
	  return (typeof object.constructor == 'function' && !isPrototype(object))
	    ? baseCreate(getPrototype(object))
	    : {};
	}
	
	/**
	 * Initializes an object clone based on its `toStringTag`.
	 *
	 * **Note:** This function only supports cloning values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to clone.
	 * @param {string} tag The `toStringTag` of the object to clone.
	 * @param {Function} cloneFunc The function to clone values.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the initialized clone.
	 */
	function initCloneByTag(object, tag, cloneFunc, isDeep) {
	  var Ctor = object.constructor;
	  switch (tag) {
	    case arrayBufferTag:
	      return cloneArrayBuffer(object);
	
	    case boolTag:
	    case dateTag:
	      return new Ctor(+object);
	
	    case dataViewTag:
	      return cloneDataView(object, isDeep);
	
	    case float32Tag: case float64Tag:
	    case int8Tag: case int16Tag: case int32Tag:
	    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
	      return cloneTypedArray(object, isDeep);
	
	    case mapTag:
	      return cloneMap(object, isDeep, cloneFunc);
	
	    case numberTag:
	    case stringTag:
	      return new Ctor(object);
	
	    case regexpTag:
	      return cloneRegExp(object);
	
	    case setTag:
	      return cloneSet(object, isDeep, cloneFunc);
	
	    case symbolTag:
	      return cloneSymbol(object);
	  }
	}
	
	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return !!length &&
	    (typeof value == 'number' || reIsUint.test(value)) &&
	    (value > -1 && value % 1 == 0 && value < length);
	}
	
	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable(value) {
	  var type = typeof value;
	  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
	    ? (value !== '__proto__')
	    : (value === null);
	}
	
	/**
	 * Checks if `func` has its source masked.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	 */
	function isMasked(func) {
	  return !!maskSrcKey && (maskSrcKey in func);
	}
	
	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;
	
	  return value === proto;
	}
	
	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to process.
	 * @returns {string} Returns the source code.
	 */
	function toSource(func) {
	  if (func != null) {
	    try {
	      return funcToString.call(func);
	    } catch (e) {}
	    try {
	      return (func + '');
	    } catch (e) {}
	  }
	  return '';
	}
	
	/**
	 * This method is like `_.clone` except that it recursively clones `value`.
	 *
	 * @static
	 * @memberOf _
	 * @since 1.0.0
	 * @category Lang
	 * @param {*} value The value to recursively clone.
	 * @returns {*} Returns the deep cloned value.
	 * @see _.clone
	 * @example
	 *
	 * var objects = [{ 'a': 1 }, { 'b': 2 }];
	 *
	 * var deep = _.cloneDeep(objects);
	 * console.log(deep[0] === objects[0]);
	 * // => false
	 */
	function cloneDeep(value) {
	  return baseClone(value, true, true);
	}
	
	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || (value !== value && other !== other);
	}
	
	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
	  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
	    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
	}
	
	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;
	
	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null && isLength(value.length) && !isFunction(value);
	}
	
	/**
	 * This method is like `_.isArrayLike` except that it also checks if `value`
	 * is an object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array-like object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArrayLikeObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLikeObject(document.body.children);
	 * // => true
	 *
	 * _.isArrayLikeObject('abc');
	 * // => false
	 *
	 * _.isArrayLikeObject(_.noop);
	 * // => false
	 */
	function isArrayLikeObject(value) {
	  return isObjectLike(value) && isArrayLike(value);
	}
	
	/**
	 * Checks if `value` is a buffer.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.3.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
	 * @example
	 *
	 * _.isBuffer(new Buffer(2));
	 * // => true
	 *
	 * _.isBuffer(new Uint8Array(2));
	 * // => false
	 */
	var isBuffer = nativeIsBuffer || stubFalse;
	
	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8-9 which returns 'object' for typed array and other constructors.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}
	
	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}
	
	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}
	
	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}
	
	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	function keys(object) {
	  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
	}
	
	/**
	 * This method returns a new empty array.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {Array} Returns the new empty array.
	 * @example
	 *
	 * var arrays = _.times(2, _.stubArray);
	 *
	 * console.log(arrays);
	 * // => [[], []]
	 *
	 * console.log(arrays[0] === arrays[1]);
	 * // => false
	 */
	function stubArray() {
	  return [];
	}
	
	/**
	 * This method returns `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {boolean} Returns `false`.
	 * @example
	 *
	 * _.times(2, _.stubFalse);
	 * // => [false, false]
	 */
	function stubFalse() {
	  return false;
	}
	
	module.exports = cloneDeep;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(16)(module)))

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../../index.d.ts" />
	"use strict";
	var configuration_1 = __webpack_require__(2);
	var string_1 = __webpack_require__(18);
	function deserialize(resource, payload) {
	    var deserializer = new Deserializer(payload);
	    return deserializer.deserialize(resource);
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = deserialize;
	var Deserializer = (function () {
	    function Deserializer(payload) {
	        this._models = [];
	        this._resources = [];
	        this.payload = payload;
	        this.addResources(payload.data);
	        this.addResources(payload.included);
	    }
	    Deserializer.prototype.addResources = function (data) {
	        if (Array.isArray(data)) {
	            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
	                var datum = data_1[_i];
	                this._resources.push(datum);
	            }
	        }
	        else {
	            this._resources.push(data);
	        }
	    };
	    Deserializer.prototype.deserialize = function (resource, isRelation) {
	        var record = this.findModel(resource);
	        if (!record) {
	            if (isRelation) {
	                var hydrated = this.findResource(resource);
	                if (hydrated)
	                    resource = hydrated;
	            }
	            record = this._deserialize(resource);
	        }
	        return record;
	    };
	    Deserializer.prototype._deserialize = function (resource) {
	        var klass = configuration_1.default.modelForType(resource.type);
	        var instance = new klass({ id: resource.id });
	        this._models.push(instance);
	        instance.attributes = resource.attributes;
	        this._processRelationships(instance, resource.relationships);
	        instance.__meta__ = resource.meta;
	        return instance;
	    };
	    Deserializer.prototype._processRelationships = function (instance, relationships) {
	        var _this = this;
	        this._iterateValidRelationships(instance, relationships, function (relationName, relationData) {
	            if (Array.isArray(relationData)) {
	                for (var _i = 0, relationData_1 = relationData; _i < relationData_1.length; _i++) {
	                    var datum = relationData_1[_i];
	                    var relatedRecord = _this.deserialize(datum, true);
	                    instance[relationName].push(relatedRecord);
	                }
	            }
	            else {
	                var relatedRecord = _this.deserialize(relationData, true);
	                instance[relationName] = relatedRecord;
	            }
	        });
	    };
	    Deserializer.prototype._iterateValidRelationships = function (instance, relationships, callback) {
	        for (var key in relationships) {
	            var relationName = string_1.camelize(key);
	            if (instance.klass.attributeList.indexOf(relationName) >= 0) {
	                var relationData = relationships[key].data;
	                if (!relationData)
	                    continue; // only links, empty, etc
	                callback(relationName, relationData);
	            }
	        }
	    };
	    Deserializer.prototype.findModel = function (resourceIdentifier) {
	        return this._models.filter(function (m) {
	            return m.id == resourceIdentifier.id && m.klass.jsonapiType == resourceIdentifier.type;
	        })[0];
	    };
	    Deserializer.prototype.findResource = function (resourceIdentifier) {
	        return this._resources.filter(function (r) {
	            return r.id == resourceIdentifier.id && r.type == resourceIdentifier.type;
	        })[0];
	    };
	    return Deserializer;
	}());


/***/ },
/* 18 */
/***/ function(module, exports) {

	"use strict";
	var underscore = function (str) {
	    return str.replace(/([A-Z])/g, function ($1) { return "_" + $1.toLowerCase(); });
	};
	exports.underscore = underscore;
	var camelize = function (str) {
	    return str.replace(/(\_[a-z])/g, function ($1) { return $1.toUpperCase().replace('_', ''); });
	};
	exports.camelize = camelize;


/***/ },
/* 19 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/// <reference path="../../index.d.ts" />
	"use strict";
	function default_1(superclass, classObj) {
	    global.__extends(Model, superclass);
	    function Model() {
	        var _this = superclass.apply(this, arguments) || this;
	        for (var prop in classObj) {
	            if (prop !== 'static' && classObj.hasOwnProperty(prop)) {
	                _this[prop] = classObj[prop];
	            }
	        }
	        return _this;
	    }
	    for (var classProp in classObj.static) {
	        Model[classProp] = classObj.static[classProp];
	    }
	    superclass.inherited(Model);
	    return Model;
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = default_1;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var attribute_1 = __webpack_require__(3);
	var model_1 = __webpack_require__(5);
	var Base = (function (_super) {
	    __extends(Base, _super);
	    function Base() {
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i] = arguments[_i];
	        }
	        var _this = _super.call(this) || this;
	        _this.isRelationship = true;
	        _this.jsonapiType = args[0];
	        return _this;
	    }
	    Base.prototype.getter = function (context) {
	        return context.relationships[this.name];
	    };
	    Base.prototype.setter = function (context, val) {
	        if (!val.hasOwnProperty('isRelationship')) {
	            if (!(val instanceof model_1.default) && !(Array.isArray(val))) {
	                val = new this.klass(val);
	            }
	            context.relationships[this.name] = val;
	        }
	    };
	    return Base;
	}(attribute_1.default));
	var HasMany = (function (_super) {
	    __extends(HasMany, _super);
	    function HasMany() {
	        return _super.apply(this, arguments) || this;
	    }
	    HasMany.prototype.getter = function (context) {
	        var gotten = _super.prototype.getter.call(this, context);
	        if (!gotten) {
	            this.setter(context, []);
	            return _super.prototype.getter.call(this, context);
	        }
	        else {
	            return gotten;
	        }
	    };
	    return HasMany;
	}(Base));
	var HasOne = (function (_super) {
	    __extends(HasOne, _super);
	    function HasOne() {
	        return _super.apply(this, arguments) || this;
	    }
	    return HasOne;
	}(Base));
	var BelongsTo = (function (_super) {
	    __extends(BelongsTo, _super);
	    function BelongsTo() {
	        return _super.apply(this, arguments) || this;
	    }
	    return BelongsTo;
	}(Base));
	var hasMany = function () {
	    var args = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        args[_i] = arguments[_i];
	    }
	    return new (HasMany.bind.apply(HasMany, [void 0].concat(args)))();
	};
	exports.hasMany = hasMany;
	var hasOne = function () {
	    var args = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        args[_i] = arguments[_i];
	    }
	    return new (HasOne.bind.apply(HasOne, [void 0].concat(args)))();
	};
	exports.hasOne = hasOne;
	var belongsTo = function () {
	    var args = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        args[_i] = arguments[_i];
	    }
	    return new (BelongsTo.bind.apply(BelongsTo, [void 0].concat(args)))();
	};
	exports.belongsTo = belongsTo;


/***/ }
/******/ ])
});
;
//# sourceMappingURL=jsorm.js.map