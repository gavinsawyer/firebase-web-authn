/*
 * Copyright © 2026 Gavin William Sawyer. All rights reserved.
 */

const { configs }    = require("@eslint/js");
const { FlatCompat } = require("@eslint/eslintrc");

const angularEslintPlugin = require("@angular-eslint/eslint-plugin");
const nxEslintPlugin      = require("@nx/eslint-plugin");


const compat = new FlatCompat(
  {
    baseDirectory:     __dirname,
    recommendedConfig: configs.recommended,
    allConfig:         configs.all,
  },
);

module.exports = [
  {
    ignores: [
      "**/*-debug.log",
      "**/.DS_Store",
      ".angular",
      ".idea",
      ".run",
      "dist",
      "node_modules",
      "tmp",
      ".firebase",
      ".runtimeconfig.json",
      ".service-account.json",
      "gha-creds-*.json",
    ],
  },
  {
    plugins: {
      "@angular-eslint": angularEslintPlugin,
      "@nx":             nxEslintPlugin,
    },
  },
  ...compat.extends(
    "plugin:@angular-eslint/template/accessibility",
    "plugin:@angular-eslint/template/recommended",
    "plugin:@nx/angular-template",
  ).map(
    (config) => ({
      ...config,
      files: [ "**/*.html" ],
    }),
  ),
  ...compat.extends(
    "plugin:@nx/typescript",
    "plugin:@nx/angular",
    "plugin:@nx/typescript",
  ).map(
    (config) => ({
      ...config,
      files: [ "**/*.ts" ],
    }),
  ),
  {
    files:           [ "**/*.json" ],
    languageOptions: { parser: require("jsonc-eslint-parser") },
    rules:           {
      "@nx/dependency-checks": [
        "error",
        {
          buildTargets:        [ "build", "build--cloud-functions" ],
          ignoredDependencies: [
            "@firebase-web-authn/api",
            "@firebase-web-authn/browser",
            "@firebase-web-authn/extension",
            "@firebase-web-authn/server",
            "@firebase-web-authn/types",
            "firebase-admin",
            "firebase-functions",
          ],
        },
      ],
    },
  },
  {
    files: [ "**/*.ts" ],
    rules: {
      "@angular-eslint/no-input-rename":  [ "off" ],
      "@angular-eslint/no-output-rename": [ "off" ],
      "@nx/enforce-module-boundaries":    [
        "error",
        {
          allow:                         [],
          depConstraints:                [
            {
              onlyDependOnLibsWithTags: [ "*" ],
              sourceTag:                "*",
            },
          ],
          enforceBuildableLibDependency: true,
        },
      ],
    },
  },
  {
    files: [ "apps/**/*.ts" ],
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        {
          prefix: "app-",
          style:  "kebab-case",
          type:   "element",
        },
      ],
      "@angular-eslint/directive-selector": [
        "error",
        {
          prefix: "app",
          style:  "camelCase",
          type:   "attribute",
        },
      ],
      "@angular-eslint/pipe-prefix":        [
        "error",
        { prefixes: [ "app" ] },
      ],
    },
  },
];
