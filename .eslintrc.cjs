module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['airbnb', 'plugin:prettier/recommended'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'linebreak-style': 'off',
    'import/extensions': [
      'error',
      {
        js: 'always',
      },
    ],
    'import/prefer-default-export': 'off',
    'no-param-reassign': 'off',
  },
  globals: {
    localStorage: 'readonly',
  },
};
