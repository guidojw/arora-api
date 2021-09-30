'use strict'

module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: 'standard-with-typescript',
  parserOptions: {
    ecmaVersion: 2020,
    project: './tsconfig.json',
    sourceType: 'module'
  },
  plugins: ['unicorn'],
  rules: {
    'max-len': [
      'error',
      120,
      {
        ignoreTemplateLiterals: true
      }
    ],
    'sort-imports': 'error',
    'unicorn/prefer-node-protocol': 'error',
    '@typescript-eslint/explicit-member-accessibility': 'error'
  }
}
