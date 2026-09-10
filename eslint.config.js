const expoConfig = require('eslint-config-expo/flat');

/** Jest's globals, declared explicitly so tests need no extra dependency. */
const jestGlobals = {
  afterAll: 'readonly',
  afterEach: 'readonly',
  beforeAll: 'readonly',
  beforeEach: 'readonly',
  describe: 'readonly',
  expect: 'readonly',
  it: 'readonly',
  jest: 'readonly',
  test: 'readonly',
};

module.exports = [
  ...expoConfig,
  {
    ignores: ['node_modules/**', 'android/**', 'ios/**', 'coverage/**', 'docs/**', '.expo/**'],
  },
  {
    rules: {
      // PRD 3.5 (NFR-08): keep modules small enough to review in one sitting.
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: ['tests/**/*.js', '**/*.test.js'],
    languageOptions: { globals: jestGlobals },
  },
];
