import { defineConfig, globalIgnores } from "eslint/config";
import babelParser from "@babel/eslint-parser";
import globals from "globals";

export default defineConfig([
{
    languageOptions: {
        parser: babelParser,
        globals: {
            ...globals.browser,
            ...globals.node,
        },
    },
    extends: [
    ],
    plugins: {
    },
    rules: {
      "no-empty-label": 0,
      "no-labels": 1,

      "no-arrow-condition": 0,
      "no-confusing-arrow": 2,
      "no-constant-condition": 2,

      "space-after-keywords": 0,
      "space-before-keywords": 0,
      "space-return-throw-case": 0,
      "keyword-spacing": 2,

      "filenames/filenames": 0,

      "no-magic-numbers": 0,
      "consistent-this": 0,
      "prefer-template": 0,
      "max-len": [
        "warn",
        {
            code: 100,
        },
      ],

      "max-params": ["error", 6],

      "no-console": "off",

      "comma-dangle": [
        "error",
        "always-multiline",
      ],
    //   "sourceType": "module"

      // "max-statements": ["error", 30]

    },
    // globalIgnores(["dist/**/*"], "Ignore Dist Directory"),
    // Note: there should be no other properties in this object
    ignores: [
        "dist/**/*",
        "**/*.min.js",
        "**/*.min.es6",
        "rollup.config.js",
    ],
},
]);
