module.exports = {
    "extends": "walmart/configurations/es6-browser",
    "plugins": [
        "import"
    ],
    "rules": {
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
      "max-len": ["warn", {code: 160}],

      "max-params": ["error", 6],

      "no-console": "off"

      // "max-statements": ["error", 30]

    },
    "env": {
        "browser": true,
        "node": true
    }
};
