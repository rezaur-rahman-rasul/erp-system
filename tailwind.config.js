const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'apps/**/src/**/!(*.stories|*.spec).{ts,html}'),
    join(__dirname, 'libs/**/src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Segoe UI Variable"',
          '"Trebuchet MS"',
          ...defaultTheme.fontFamily.sans,
        ],
      },
      colors: {
        brand: {
          50: '#eef7f5',
          100: '#d8ebe7',
          200: '#b4d8d1',
          300: '#89bdb3',
          400: '#5a9d92',
          500: '#3c857b',
          600: '#2f6c64',
          700: '#285652',
          800: '#244541',
          900: '#203936',
          950: '#102222',
        },
        sand: {
          50: '#faf7f2',
          100: '#f4eee3',
          200: '#e8dcc8',
          300: '#dac3a2',
          400: '#c8a179',
          500: '#b88556',
          600: '#a36f47',
          700: '#85573b',
          800: '#6c4733',
          900: '#593c2d',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          800: '#1e293b',
          900: '#0f172a',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
        purple: '#8b5cf6',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'panel': '0 24px 70px -46px rgba(15, 23, 42, 0.45)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '1.9rem',
      }
    },
  },
  plugins: [],
};
