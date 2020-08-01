import { readFileSync } from "fs"
import nodeResolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import { uglify } from "rollup-plugin-uglify"

const pkg = require("./package.json")

const isProduction = process.env.NODE_ENV === "production"

const banner = readFileSync("banner.js", "utf-8")
  .replace("${name}", pkg.name)
  .replace("${version}", pkg.version)
  .replace("${author}", pkg.author)
  .replace("${homepage}", pkg.homepage)

export default {
  input: pkg.module,
  plugins: [
    isProduction ? uglify({}) : {},
    nodeResolve(),
    commonjs({ include: "./node_modules/**" }),
  ],
  output: {
    name: pkg.name,
    file: `./dist/${pkg.name}.${isProduction ? "min.js" : "js"}`,
    format: "umd",
    sourcemap: false,
    banner: banner,
  },
}
