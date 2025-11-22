import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // Allow any for flexibility in SDK

      // Import rules
      'import/extensions': 'off',
      'import/no-unresolved': 'off', // Let TypeScript handle this
      'import/prefer-default-export': 'off',

      // General rules
      'no-console': 'off', // Allow console in SDK for debugging
      'class-methods-use-this': 'off', // Common in class-based APIs
      'no-underscore-dangle': 'off', // Allow private properties
      'max-classes-per-file': 'off', // Allow multiple classes in modules
      'no-restricted-syntax': 'off', // Allow for...of loops
      'no-await-in-loop': 'off', // Allow await in loops for API calls
      'no-useless-escape': 'error',
      'no-unused-vars': 'off', // Let TypeScript handle this
    },
  },
  {
    files: ['tests/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.jest,
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        vi: 'readonly',
        beforeAll: 'readonly',
        performance: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in tests

      // Import rules
      'import/extensions': 'off',
      'import/no-unresolved': 'off', // Let TypeScript handle this
      'import/prefer-default-export': 'off',

      // General rules
      'no-console': 'off', // Allow console in tests
      'class-methods-use-this': 'off',
      'no-underscore-dangle': 'off',
      'max-classes-per-file': 'off',
      'no-restricted-syntax': 'off',
      'no-await-in-loop': 'off',
      'no-useless-escape': 'error',
      'no-unused-vars': 'off', // Let TypeScript handle this
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '*.js', '*.mjs'],
  },
];