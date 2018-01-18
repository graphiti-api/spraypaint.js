"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inBrowser = typeof window !== "undefined";
exports.isProd = process.env.NODE_ENV === "production";
exports.config = {
    productionTip: !exports.isProd
};
//# sourceMappingURL=env.js.map