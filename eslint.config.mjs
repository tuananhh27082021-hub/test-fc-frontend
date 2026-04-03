import antfu from '@antfu/eslint-config';
import nextPlugin from '@next/eslint-plugin-next';
import jestDom from 'eslint-plugin-jest-dom';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import playwright from 'eslint-plugin-playwright';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tailwind from 'eslint-plugin-tailwindcss';
import testingLibrary from 'eslint-plugin-testing-library';

export default antfu(
  {
    react: true,
    typescript: true,

    lessOpinionated: true,
    isInEditor: false,

    stylistic: {
      semi: true,
    },

    formatters: {
      css: true,
    },

    ignores: ['migrations/**/*', 'next-env.d.ts'],
  },
  ...tailwind.configs['flat/recommended'],
  jsxA11y.flatConfigs.recommended,
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['**/*.test.ts?(x)'],
    ...testingLibrary.configs['flat/react'],
    ...jestDom.configs['flat/recommended'],
  },
  {
    files: ['**/*.spec.ts'],
    ...playwright.configs['flat/recommended'],
  },
  {
    rules: {
      'import/order': 'off', // Avoid conflicts with `simple-import-sort` plugin
      'sort-imports': 'off', // Avoid conflicts with `simple-import-sort` plugin
      'style/brace-style': ['error', '1tbs'], // Use the default brace style
      'ts/consistent-type-definitions': ['error', 'type'], // Use `type` instead of `interface`
      'react/prefer-destructuring-assignment': 'off', // Vscode doesn't support automatically destructuring, it's a pain to add a new variable
      'node/prefer-global/process': 'off', // Allow using `process.env`
      'test/prefer-lowercase-title': 'off', // Allow using uppercase titles in test titles
      'react/no-unstable-context-value': 'off',
      'ts/no-use-before-define': 'off',
      'jsx-a11y/anchor-has-content': 'warn',
      'ts/no-empty-object-type': 'warn',
      'no-console': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      'unused-imports/no-unused-vars': 'warn',
      'react/no-unstable-default-props': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'regexp/no-unused-capturing-group': 'off',
      'style/multiline-ternary': 'warn',
    },
  },
);
