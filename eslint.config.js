/*
 * Copyright © 2025 Gavin Sawyer. All rights reserved.
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
    files: [ "apps/website/src/app/components/lib/**/*.ts" ],
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        {
          prefix: "website",
          style:  "kebab-case",
          type:   "element",
        },
      ],
    },
  },
  {
    files: [ "apps/website/src/app/directives/lib/**/*.ts" ],
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          prefix: "website",
          style:  "camelCase",
          type:   "attribute",
        },
      ],
    },
  },
  {
    files: [ "apps/website/src/app/pipes/src/lib/**/*.ts" ],
    rules: {
      "@angular-eslint/pipe-prefix": [
        "error",
        { prefixes: [ "website" ] },
      ],
    },
  },
];
