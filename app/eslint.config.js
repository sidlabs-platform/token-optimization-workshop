const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
module.exports = [
  { ignores: ['**/dist/**', '**/coverage/**', '**/node_modules/**', 'seed-stats.json'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parserOptions: { ecmaVersion: 2022, sourceType: 'module' } },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.config.js'],
    languageOptions: { globals: { module: 'readonly', require: 'readonly' } },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
];
