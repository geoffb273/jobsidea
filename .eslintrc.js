module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    project: ['tsconfig.json'],
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/recommended',
    'prettier',
  ],
  plugins: ['prettier', 'jest'],
  rules: {
    'arrow-body-style': 'off',
    'import/no-import-module-exports': 'off',
    'import/no-anonymous-default-export': 'off',
    'import/prefer-default-export': 'off',
    'lines-between-class-members': 'off',
    'no-unused-vars': ['off', { argsIgnorePattern: '^_' }],
    'no-prototype-builtins': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/array-type': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    'prettier/prettier': 'error',
    '@typescript-eslint/unbound-method': 'off',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal'],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
  ignorePatterns: [
    '*.js',
    '*.sh',
    'generated/graphql.ts',
    'package.json',
    'tsconfig.json',
    '*.graphql',
    '*.json',
    '.eslintrc.js',
    '*.yml'
  ],
};
