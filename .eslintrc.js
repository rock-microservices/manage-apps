module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  extends: [
    "ts-react-important-stuff",
    "plugin:prettier/recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
  ],
  rules: {
    "no-unsafe-optional-chaining": 2,
    "no-console": 2,
    "react/display-name": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-empty-interface": 0,
    "react/prop-types": 0,
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "react/jsx-no-target-blank": 0,
  },
};
