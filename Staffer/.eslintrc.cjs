module.exports = {
  extends: [
    '../.eslintrc.cjs',
    'plugin:react/recommended',
    'plugin:react-native/all',
  ],
  rules: {
    'react/jsx-filename-extension': [
      'warn',
      { extensions: ['.js', '.jsx', '.tsx', '.ts', '.cjs'] },
    ],
    'react/react-in-jsx-scope': 'off',
    'react/state-in-constructor': 'off',
    'react/display-name': 'off',
    'react-native/no-raw-text': 'off',
    'react-native/no-inline-styles': 'off',
    'react-native/split-platform-components': 'off',
    'import/prefer-default-export': 'off',
    'jsx-a11y/media-has-caption': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    'import/order': ['off'],
  },
  settings: {
    'import/ignore': ['react-native'],
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    react: {
      version: 'detect',
    },
  },
};
