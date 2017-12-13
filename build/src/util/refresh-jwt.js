"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var configuration_1 = require("../configuration");
function refreshJWT(klass, serverResponse) {
    var jwt = serverResponse.headers.get('X-JWT');
    var localStorage = configuration_1.default.localStorage;
    if (localStorage) {
        var localStorageKey = configuration_1.default.jwtLocalStorage;
        if (localStorageKey) {
            localStorage['setItem'](localStorageKey, jwt);
        }
    }
    if (jwt) {
        klass.setJWT(jwt);
    }
}
exports.default = refreshJWT;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmcmVzaC1qd3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbC9yZWZyZXNoLWp3dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGtEQUFzQztBQUV0QyxvQkFBbUMsS0FBbUIsRUFBRSxjQUF3QjtJQUM5RSxJQUFJLEdBQUcsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5QyxJQUFJLFlBQVksR0FBRyx1QkFBTSxDQUFDLFlBQVksQ0FBQztJQUV2QyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLElBQUksZUFBZSxHQUFHLHVCQUFNLENBQUMsZUFBZSxDQUFDO1FBQzdDLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDcEIsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNoRCxDQUFDO0lBQ0gsQ0FBQztJQUVELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDUixLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7QUFDSCxDQUFDO0FBZEQsNkJBY0MifQ==