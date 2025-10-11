// https://docs.expo.dev/guides/using-eslint/
// eslint.config.js
const { defineConfig } = require('eslint/config');
const js = require('@eslint/js');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');

module.exports = defineConfig([
  // Configuration JavaScript de base
  js.configs.recommended,

  // Configuration pour React
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: reactPlugin,
    },
    settings: {
      react: {
        version: 'detect', // Détecte automatiquement la version de React
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },

  // Configuration pour React Hooks
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Configuration TypeScript 
  ...(function() {
    try {
      const tseslint = require('@typescript-eslint/eslint-plugin');
      const tsparser = require('@typescript-eslint/parser');
      
      return [
        {
          files: ['**/*.{ts,tsx}'],
          languageOptions: {
            parser: tsparser,
          },
          plugins: {
            '@typescript-eslint': tseslint,
          },
          rules: {
            ...tseslint.configs.recommended.rules,
          },
        }
      ];
    } catch (error) {
      // TypeScript n'est pas installé, on retourne un tableau vide
      return [];
    }
  })(),

  // Règles personnalisées pour tout le projet
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Bonnes pratiques générales
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      
      // Règles de style de code
      'quotes': ['warn', 'single'],
      'semi': ['error', 'always'],
      'indent': ['warn', 2],
      'comma-dangle': ['warn', 'always-multiline'],

      // Bonnes pratiques React/React Native
      'react/prop-types': 'off', // Désactivé si vous utilisez TypeScript
      'react/display-name': 'error',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-unknown-property': 'error',
      'react/require-render-return': 'error',
    },
  },

  // Fichiers à ignorer
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.expo/**',
      'expo-plugins/**',
      '*.config.js',
      'web-build/**',
    ],
  },
]);