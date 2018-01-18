export var inBrowser = typeof window !== "undefined";
export var isProd = process.env.NODE_ENV === "production";
export var config = {
    productionTip: !isProd
};
//# sourceMappingURL=env.js.map