module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'prettier',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint', 'react'],
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true,
    jest: true,
    jasmine: true,
  },
  rules: {
    'prettier/prettier': 'error',
    'generator-star-spacing': [0],
    'consistent-return': [0],
    'react/forbid-prop-types': [0],
    'global-require': [1],
    'import/prefer-default-export': [0],
    'react/jsx-no-bind': [0],
    'react/prop-types': [0],
    'react/prefer-stateless-function': [0],
    'no-else-return': [0],
    'no-restricted-syntax': [0],
    'import/no-extraneous-dependencies': [0],
    'no-use-before-define': [0],
    'jsx-a11y/no-static-element-interactions': [0],
    'jsx-a11y/no-noninteractive-element-interactions': [0],
    'jsx-a11y/click-events-have-key-events': [0],
    'jsx-a11y/anchor-is-valid': [0],
    'no-nested-ternary': [0],
    'arrow-body-style': [0],
    'import/extensions': [0],
    'no-bitwise': [0],
    'no-cond-assign': [0],
    'import/no-unresolved': [0],
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'ignore',
      },
    ],
    'object-curly-newline': [0],
    'no-restricted-globals': [0],
    'require-yield': [1],
    'no-console': 'off',
    'no-underscore-dangle': 'off',
    'spaced-comment': 'off',
    // Airbnb rules begin : https://github.com/airbnb/javascript
    // 2.1
    'prefer-const': [2],
    'no-const-assign': [2],
    // 2.2
    'no-var': [2],
    // 3.1
    'no-new-object': [2],
    // 3.3/3.4
    'object-shorthand': ['error', 'always', { avoidQuotes: true }],
    // 3.6
    'quote-props': ['error', 'as-needed'],
    // 4.1
    'no-array-constructor': ['error'],
    // 4.7
    'array-callback-return': ['error'],
    // 5.1
    'prefer-destructuring': 'off',
    // 6.3
    'prefer-template': ['error'],
    'template-curly-spacing': ['error', 'never'],
    // 6.4
    'no-eval': ['error'],
    // 6.5
    'no-useless-escape': ['error'],
    // 7.1
    'func-style': ['error', 'expression'],
    // 7.2
    'wrap-iife': ['error', 'outside'],
    // 7.3
    'no-loop-func': ['error'],
    // 7.6
    'prefer-rest-params': ['error'],
    // 7.10
    'no-new-func': ['error'],
    // 7.11
    'space-before-function-paren': ['error', 'never'],
    'space-before-blocks': ['error', 'always'],
    // 7.12
    'no-param-reassign': 'error',
    // 7.14
    'prefer-spread': 'error',
    // 7.15
    // 'function-paren-newline': ['error', 'multiline'],
    // 8.1
    'prefer-arrow-callback': ['error'],
    'arrow-spacing': ['error', { before: true, after: true }],
    // 8.2
    'arrow-parens': ['error', 'as-needed'],
    // 8.5
    // 'no-confusing-arrow': ['error', { allowParens: true }],
    // 8.6
    // 'implicit-arrow-linebreak': ['error', 'beside'],
    // Airbnb rules end
    quotes: ['error', 'single'],
    'no-unused-vars': 'off',
    'no-undef': 'off',
    'func-style': 'off',
    'space-before-function-paren': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/no-unknown-property': 'off',
    'react/display-name': 'off',
    'no-async-promise-executor': 'off',
    'array-callback-return': 'off',
    'no-param-reassign': 'off',
    'no-dupe-keys': 'off',
    'no-case-declarations': 'off',
    'no-fallthrough': 'off',
  },
  parserOptions: {
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      experimentalDecorators: true,
    },
  },
  settings: {
    polyfills: ['fetch', 'promises'],
    react: {
      version: 'detect',
    },
  },
};
