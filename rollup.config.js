import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import pkg from './package.json'
import babel from 'rollup-plugin-babel'
import { uglify } from 'rollup-plugin-uglify'

export default [{
  input: 'src/main.js',
  output: {
    name: 'ifetch',
    file: pkg.browser,
    format: 'iife',
    env: 'production'
  },
  plugins: [
    resolve({
      browser: true
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    babel({
      babelrc: false,
      presets: [
        ['env', {
          modules: false
        }]
      ],
      runtimeHelpers: true
    }),
    uglify()
  ]
}, {
  input: 'src/main.js',
  external: ['query-string'],
  output: [{
    file: pkg.main,
    format: 'cjs'
  },
  {
    file: pkg.module,
    format: 'es'
  }
  ]
}]
