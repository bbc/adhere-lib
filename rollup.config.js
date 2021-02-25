
import babel from 'rollup-plugin-babel';
import includePaths from 'rollup-plugin-includepaths';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
//import json from 'rollup-plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

export default {
  entry: 'src/index.es6',
  format: 'iife',
  plugins: [
    builtins(),
    includePaths({
      include: {},
      paths: ['src/'],
      external: ['aws-sdk'],
      extensions: ['.js', '.es6'],
    }),
    globals(),
    //json(),
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      runtimeHelpers: true,
      presets: [
        'es2017'
      ],
      plugins: [
        'transform-class-properties'
      ]
    }),
    resolve({
      module: true,
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs(),
  ],
  dest: 'bin/js/bundle.js',
};
