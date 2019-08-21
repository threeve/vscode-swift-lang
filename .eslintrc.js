// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

module.exports = {
    parser: "@typescript-eslint/parser",
    extends: [
        "plugin:@typescript-eslint/recommended",
        "prettier/@typescript-eslint",
        "plugin:prettier/recommended",
    ],
    parserOptions: {
        project: "./tsconfig.json",
    },
    rules: {
        "prettier/prettier": "warn",
        "@typescript-eslint/explicit-function-return-type": [
            "error",
            {
                allowTypedFunctionExpressions: true,
            },
        ],
    },
};
