module.exports = {
  root: true,
  env: {
    node: false
  },
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended"
  ],
  plugins: ["@typescript-eslint"],
  rules: {
    "no-undef": "off",
    "no-unused-vars": "off",
    "no-dupe-class-members": "off", // temporarily disabled until typescript parser fixes this
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "prettier/prettier": ["warn", {
      semi: false,
      quote: 'single',
    }]
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  parser: "@typescript-eslint/parser"
}
