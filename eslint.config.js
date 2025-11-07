import { includeIgnoreFile } from '@eslint/compat';
import eslint from '@eslint/js';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import pluginReact from 'eslint-plugin-react';
import reactCompiler from 'eslint-plugin-react-compiler';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

// File path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

const baseConfig = tseslint.config({
  extends: [eslint.configs.recommended, tseslint.configs.recommended, tseslint.configs.stylistic],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'off',
    // Relax TypeScript strict rules that are too restrictive for development
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
  },
});

const jsxA11yConfig = tseslint.config({
  files: ['**/*.{js,jsx,ts,tsx}'],
  extends: [jsxA11y.flatConfigs.recommended],
  languageOptions: {
    ...jsxA11y.flatConfigs.recommended.languageOptions,
  },
  rules: {
    ...jsxA11y.flatConfigs.recommended.rules,
    // Relax some accessibility rules that are too restrictive
    'jsx-a11y/heading-has-content': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/label-has-associated-control': 'warn',
  },
});

const reactConfig = tseslint.config({
  files: ['**/*.{js,jsx,ts,tsx}'],
  extends: [pluginReact.configs.flat.recommended],
  languageOptions: {
    ...pluginReact.configs.flat.recommended.languageOptions,
    globals: {
      window: true,
      document: true,
    },
  },
  plugins: {
    'react-hooks': eslintPluginReactHooks,
    'react-compiler': reactCompiler,
  },
  settings: { react: { version: 'detect' } },
  rules: {
    ...eslintPluginReactHooks.configs.recommended.rules,
    'react/react-in-jsx-scope': 'off',
    'react-compiler/react-compiler': 'warn', // Relax from error to warn
    // Disable prop-types since we use TypeScript
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'warn',
  },
});

// Completely exclude Astro files from ESLint to avoid parsing issues
// Astro files will not be linted at all

const jsConfig = tseslint.config({
  files: ['**/*.{js,mjs}'],
  languageOptions: {
    globals: {
      localStorage: 'readonly',
      document: 'readonly',
      window: 'readonly',
      console: 'readonly',
      process: 'readonly',
    },
  },
});

export default tseslint.config(
  includeIgnoreFile(gitignorePath),
  baseConfig,
  jsxA11yConfig,
  reactConfig,
  jsConfig,
  eslintPluginPrettier
);
