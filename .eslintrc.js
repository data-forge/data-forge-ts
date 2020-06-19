module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
      '@typescript-eslint',
    ],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        'no-var': 1,
        '@typescript-eslint/no-this-alias': 0,
        '@typescript-eslint/ban-ts-comment': 0,
        '@typescript-eslint/ban-types': 1
    }
  };