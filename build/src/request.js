"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var configuration_1 = require("./configuration");
var colorize_1 = require("./util/colorize");
var Request = /** @class */ (function () {
    function Request() {
    }
    Request.prototype.get = function (url, options) {
        options.method = 'GET';
        return this._fetchWithLogging(url, options);
    };
    Request.prototype.post = function (url, payload, options) {
        options.method = 'POST';
        options.body = JSON.stringify(payload);
        return this._fetchWithLogging(url, options);
    };
    Request.prototype.put = function (url, payload, options) {
        options.method = 'PUT';
        options.body = JSON.stringify(payload);
        return this._fetchWithLogging(url, options);
    };
    Request.prototype.delete = function (url, options) {
        options.method = 'DELETE';
        return this._fetchWithLogging(url, options);
    };
    // private
    Request.prototype._logRequest = function (verb, url) {
        configuration_1.default.logger.info(colorize_1.default('cyan', verb + ": ") + colorize_1.default('magenta', url));
    };
    Request.prototype._logResponse = function (responseJSON) {
        configuration_1.default.logger.debug(colorize_1.default('bold', JSON.stringify(responseJSON, null, 4)));
    };
    Request.prototype._fetchWithLogging = function (url, options) {
        var _this = this;
        this._logRequest(options.method, url);
        var promise = this._fetch(url, options);
        promise.then(function (response) {
            _this._logResponse(response['jsonPayload']);
        });
        return promise;
    };
    Request.prototype._fetch = function (url, options) {
        return new Promise(function (resolve, reject) {
            var fetchPromise = fetch(url, options);
            fetchPromise.then(function (response) {
                response.json().then(function (json) {
                    response['jsonPayload'] = json;
                    resolve(response);
                }).catch(function (e) { throw (e); });
            });
            fetchPromise.catch(reject);
        });
    };
    return Request;
}());
exports.default = Request;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZXF1ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaURBQXFDO0FBQ3JDLDRDQUF1QztBQUV2QztJQUFBO0lBeURBLENBQUM7SUF4REMscUJBQUcsR0FBSCxVQUFJLEdBQVksRUFBRSxPQUFvQjtRQUNwQyxPQUFPLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQsc0JBQUksR0FBSixVQUFLLEdBQVcsRUFBRSxPQUFlLEVBQUUsT0FBb0I7UUFDckQsT0FBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDeEIsT0FBTyxDQUFDLElBQUksR0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXpDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCxxQkFBRyxHQUFILFVBQUksR0FBVyxFQUFFLE9BQWUsRUFBRSxPQUFvQjtRQUNwRCxPQUFPLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUN2QixPQUFPLENBQUMsSUFBSSxHQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFekMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVELHdCQUFNLEdBQU4sVUFBTyxHQUFXLEVBQUUsT0FBb0I7UUFDdEMsT0FBTyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7UUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVELFVBQVU7SUFFRiw2QkFBVyxHQUFuQixVQUFvQixJQUFZLEVBQUUsR0FBVztRQUMzQyx1QkFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQVEsQ0FBQyxNQUFNLEVBQUssSUFBSSxPQUFJLENBQUMsR0FBRyxrQkFBUSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQy9FLENBQUM7SUFFTyw4QkFBWSxHQUFwQixVQUFxQixZQUFxQjtRQUN4Qyx1QkFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0JBQVEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBRU8sbUNBQWlCLEdBQXpCLFVBQTBCLEdBQVcsRUFBRSxPQUFvQjtRQUEzRCxpQkFPQztRQU5DLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN0QyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN4QyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQUMsUUFBYztZQUMxQixLQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBQzdDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBRU8sd0JBQU0sR0FBZCxVQUFlLEdBQVcsRUFBRSxPQUFvQjtRQUM5QyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTtZQUNqQyxJQUFJLFlBQVksR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBQyxRQUFRO2dCQUN6QixRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQUMsSUFBSTtvQkFDeEIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLElBQUksQ0FBQztvQkFDL0IsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNwQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQyxDQUFDLElBQU8sTUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakMsQ0FBQyxDQUFDLENBQUM7WUFFSCxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNILGNBQUM7QUFBRCxDQUFDLEFBekRELElBeURDIn0=