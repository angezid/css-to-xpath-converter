import pkg from './package.json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import babel from '@rollup/plugin-babel';
import terser from "@rollup/plugin-terser";

const src = "src/converter.js";
const years = (() => {
  const startYear = 2024,
    year = new Date().getFullYear();
  return year > startYear ? `${startYear}–${year}` : year;
})();

const output = {
    name: 'toXPath',
    file: pkg.main,
    format: 'umd',
    banner: `/*!*******************************************
* ${pkg.name} ${pkg.version}
* ${pkg.homepage}
* MIT licensed\n* Copyright (c) ${years}, ${pkg.author.name}
*********************************************/`
  },
  output_es = Object.assign({}, output, {
    format : 'es'
  }),
  plugins = [
    resolve(),
    commonjs(),
    cleanup()
  ],
  pluginsES5 = (() => {
    const newPlugins = plugins.slice();
    newPlugins.push(babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      'presets': [
        ['@babel/preset-env', {
          'modules': false
        }]
      ],
      'plugins': [
        '@babel/plugin-transform-object-assign'
      ]
    }));
    return newPlugins;
  })(),
  minifyPlugins = (() => {
    const newPlugins = plugins.slice();
    newPlugins.push(terser());
    return newPlugins;
  })(),
  minifyPluginsES5 = (() => {
    const newPlugins = pluginsES5.slice();
    newPlugins.push(terser());
    return newPlugins;
  })();

// Actual config export
export default [
// es
{
  input: src,
  output: Object.assign({}, output_es, {
    file: output_es.file.replace('.js', '.es.js')
  }),
  plugins
},
// ES5
{
  input: src,
  output,
  plugins: pluginsES5
},
// minified es
{
  input: src,
  output : Object.assign({}, output_es, {
    file: output_es.file.replace('.js', '.es.min.js')
  }),
  plugins: minifyPlugins,
},
// minified ES5
{
  input: src,
  output: Object.assign({}, output, {
    file: output.file.replace('.js', '.min.js')
  }),
  plugins: minifyPluginsES5
}];
