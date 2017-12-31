import { readFileSync } from 'fs';
import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';

const pkg = JSON.parse( readFileSync( 'package.json', 'utf-8' ) );

const isProduction = process.env.NODE_ENV === 'production';

const banner = readFileSync( 'banner.js', 'utf-8' )
	.replace( '${name}', pkg.name )
  .replace( '${version}', pkg.version )
  .replace( '${author}', pkg.author )
  .replace( '${homepage}', pkg.homepage )

export default {
  input: `./lib/index.js`,
  plugins: [
    isProduction ? uglify({}) : {},
    commonjs({ include: './node_modules/**' }),
    buble({exclude: './node_modules/**'}),
    replace({ 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) })
  ],
  banner:  banner,
  sourceMap: false,
  name: pkg.name,
  output: [
    {
      file: `./dist/${pkg.name}.${isProduction ? 'min.js' : 'js'}`,
      format: 'umd'
    }
  ]
};

