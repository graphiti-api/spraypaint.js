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
	var associations_1 = __webpack_require__(15);
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
	    Config.setup = function () {
	        for (var _i = 0, _a = this.models; _i < _a.length; _i++) {
	            var model = _a[_i];
	            this.typeMapping[model.jsonapiType] = model;
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
	        return this.typeMapping[type];
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
	var deserialize_1 = __webpack_require__(12);
	var extend_1 = __webpack_require__(14);
	var string_1 = __webpack_require__(13);
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
	    Model.includes = function (clause) {
	        return this.scope().includes(clause);
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
	    return Model;
	}());
	Model.baseUrl = process.env.BROWSER ? '' : 'http://localhost:9999';
	Model.apiNamespace = '/';
	Model.jsonapiType = 'define-in-subclass';
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
	var model_1 = __webpack_require__(5);
	var parameterize_1 = __webpack_require__(8);
	var include_directive_1 = __webpack_require__(9);
	var request_1 = __webpack_require__(10);
	var Scope = (function () {
	    function Scope(model) {
	        this._pagination = {};
	        this._filter = {};
	        this._sort = {};
	        this._fields = {};
	        this._extra_fields = {};
	        this._include = {};
	        this.model = model;
	    }
	    Scope.prototype.all = function () {
	        return this._fetch(this.model.url()).then(function (json) {
	            return json.data.map(function (datum) {
	                return model_1.default.fromJsonapi(datum, json);
	            });
	        });
	    };
	    Scope.prototype.find = function (id) {
	        return this._fetch(this.model.url(id)).then(function (json) {
	            return model_1.default.fromJsonapi(json.data, json);
	        });
	    };
	    // TODO: paginate 1
	    Scope.prototype.first = function () {
	        return this.per(1).all().then(function (models) {
	            return models[0];
	        });
	    };
	    Scope.prototype.page = function (pageNumber) {
	        this._pagination.number = pageNumber;
	        return this;
	    };
	    Scope.prototype.per = function (size) {
	        this._pagination.size = size;
	        return this;
	    };
	    Scope.prototype.where = function (clause) {
	        for (var key in clause) {
	            this._filter[key] = clause[key];
	        }
	        return this;
	    };
	    Scope.prototype.order = function (clause) {
	        if (typeof clause == "object") {
	            for (var key in clause) {
	                this._sort[key] = clause[key];
	            }
	        }
	        else {
	            this._sort[clause] = 'asc';
	        }
	        return this;
	    };
	    Scope.prototype.select = function (clause) {
	        for (var key in clause) {
	            this._fields[key] = clause[key];
	        }
	        return this;
	    };
	    Scope.prototype.selectExtra = function (clause) {
	        for (var key in clause) {
	            this._extra_fields[key] = clause[key];
	        }
	        return this;
	    };
	    Scope.prototype.includes = function (clause) {
	        var directive = new include_directive_1.default(clause);
	        var directiveObject = directive.toObject();
	        for (var key in directiveObject) {
	            this._include[key] = directiveObject[key];
	        }
	        return this;
	    };
	    Scope.prototype.asQueryParams = function () {
	        var qp = {};
	        qp['page'] = this._pagination;
	        qp['filter'] = this._filter;
	        qp['sort'] = this._sortParam(this._sort);
	        qp['fields'] = this._fields;
	        qp['extra_fields'] = this._extra_fields;
	        qp['include'] = new include_directive_1.default(this._include).toString();
	        return qp;
	    };
	    Scope.prototype.toQueryParams = function () {
	        var paramString = parameterize_1.default(this.asQueryParams());
	        if (paramString !== '') {
	            return paramString;
	        }
	    };
	    // private
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
	        var qp = this.toQueryParams();
	        if (qp) {
	            url = url + "?" + qp;
	        }
	        var request = new request_1.default();
	        return request.get(url);
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
	        if (key == 'include') {
	        }
	        if (!!value) {
	            if (prefix) {
	                key = prefix + "[" + key + "]";
	            }
	            if (Array.isArray(value)) {
	                str.push(key + "=" + value.join(','));
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
	var configuration_1 = __webpack_require__(2);
	var colorize_1 = __webpack_require__(11);
	var Request = (function () {
	    function Request() {
	    }
	    Request.prototype.get = function (url) {
	        configuration_1.default.logger.info(colorize_1.default('cyan', 'GET: ') + colorize_1.default('magenta', url));
	        return new Promise(function (resolve, reject) {
	            fetch(url).then(function (response) {
	                response.json().then(function (json) {
	                    configuration_1.default.logger.debug(colorize_1.default('bold', JSON.stringify(json, null, 4)));
	                    resolve(json);
	                });
	            });
	        });
	    };
	    return Request;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Request;


/***/ },
/* 11 */
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
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../../index.d.ts" />
	"use strict";
	var configuration_1 = __webpack_require__(2);
	var string_1 = __webpack_require__(13);
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
/* 13 */
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
/* 14 */
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
/* 15 */
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