require("@babel/register")({
  ignore: [],
  plugins: [
    ["@babel/plugin-proposal-decorators", { decoratorsBeforeExport: true }],
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-transform-modules-commonjs"
  ]
})
