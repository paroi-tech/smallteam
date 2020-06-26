module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
    "prettier/@typescript-eslint"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2018,
    "project": "./tsconfig.json",
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
    "@typescript-eslint/adjacent-overload-signatures": "warn",
    "@typescript-eslint/array-type": [
      "warn",
      {
        "default": "array"
      }
    ],
    "@typescript-eslint/ban-types": [
      "warn",
      {
        "types": {
          "Object": {
            "message": "Avoid using the `Object` type. Did you mean `object`?"
          },
          "Function": {
            "message": "Avoid using the `Function` type. Prefer a specific function type, like `() => void`."
          },
          "Boolean": {
            "message": "Avoid using the `Boolean` type. Did you mean `boolean`?"
          },
          "Number": {
            "message": "Avoid using the `Number` type. Did you mean `number`?"
          },
          "String": {
            "message": "Avoid using the `String` type. Did you mean `string`?"
          },
          "Symbol": {
            "message": "Avoid using the `Symbol` type. Did you mean `symbol`?"
          }
        }
      }
    ],
    // "@typescript-eslint/class-name-casing": "warn",
    "@typescript-eslint/consistent-type-assertions": "warn",
    "@typescript-eslint/dot-notation": "off",
    "@typescript-eslint/explicit-member-accessibility": [
      "warn",
      {
        "accessibility": "no-public"
      }
    ],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/indent": [
      "warn",
      2
    ],
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/member-delimiter-style": [
      "warn",
      {
        "multiline": {
          "delimiter": "none",
          "requireLast": true
        },
        "singleline": {
          "delimiter": "semi",
          "requireLast": false
        }
      }
    ],
    "@typescript-eslint/no-empty-function": "warn",
    "@typescript-eslint/no-empty-interface": "warn",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-misused-new": "warn",
    "@typescript-eslint/no-misused-promises": "off",
    "@typescript-eslint/no-namespace": "warn",
    "@typescript-eslint/no-parameter-properties": "off",
    "@typescript-eslint/no-unnecessary-type-assertion": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unused-expressions": "warn",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/prefer-for-of": "warn",
    "@typescript-eslint/prefer-function-type": "warn",
    "@typescript-eslint/prefer-namespace-keyword": "warn",
    "@typescript-eslint/quotes": [
      "warn",
      "double"
    ],
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/semi": [
      "warn",
      "never"
    ],
    "@typescript-eslint/triple-slash-reference": [
      "warn",
      {
        "path": "always",
        "types": "prefer-import",
        "lib": "always"
      }
    ],
    "@typescript-eslint/unified-signatures": "warn",
    "arrow-parens": [
      "off",
      "always"
    ],
    "camelcase": "warn",
    "comma-dangle": "warn",
    "complexity": "off",
    "constructor-super": "warn",
    "curly": "off",
    "eol-last": "off",
    "eqeqeq": [
      "warn",
      "smart"
    ],
    "guard-for-in": "warn",
    "id-blacklist": "warn",
    "id-match": "warn",
    // "import/order": "warn",
    // "jsdoc/check-alignment": "warn",
    // "jsdoc/check-indentation": "warn",
    // "jsdoc/newline-after-description": "warn",
    "max-classes-per-file": "off",
    "max-len": "off",
    "new-parens": "warn",
    "no-bitwise": "warn",
    "no-caller": "warn",
    "no-cond-assign": "warn",
    "no-console": "warn",
    "no-constant-condition": "off",
    "no-debugger": "warn",
    "no-empty": "warn",
    "no-eval": "warn",
    "no-fallthrough": "off",
    "no-invalid-this": "off",
    "no-multiple-empty-lines": "off",
    "no-new-wrappers": "warn",
    "no-prototype-builtins": "off",
    "no-shadow": [
      "off",
      {
        "hoist": "all"
      }
    ],
    "no-throw-literal": "warn",
    "no-trailing-spaces": "warn",
    "no-undef-init": "warn",
    "no-underscore-dangle": "warn",
    "no-unsafe-finally": "warn",
    "no-unused-labels": "warn",
    "no-var": "warn",
    "object-shorthand": "off",
    "one-var": [
      "warn",
      "never"
    ],
    "prefer-arrow/prefer-arrow-functions": "off",
    // "prefer-const": "off",
    "quote-props": "off",
    "radix": "warn",
    "space-before-function-paren": [
      "warn",
      {
        "anonymous": "always",
        "named": "never",
        "asyncArrow": "always"
      }
    ],
    "spaced-comment": [
      "warn",
      "always",
      {
        "markers": [
          "/"
        ]
      }
    ],
    "use-isnan": "warn",
    "valid-typeof": "off",
    // "@typescript-eslint/tslint/config": [
    //   "error",
    //   {
    //     "rules": {
    //       "whitespace": [
    //         true,
    //         {
    //           "check-module": false
    //         }
    //       ]
    //     }
    //   }
    // ]
  }
}