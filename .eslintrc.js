module.exports = {
    "env": {
      "es6": true
    },
    "extends": [
      "plugin:react/recommended",
      "plugin:@typescript-eslint/recommended",
      "airbnb",
      "plugin:import/errors",
      "plugin:import/warnings",
      "plugin:import/typescript",
      "prettier",
      "prettier/react",
      "prettier/@typescript-eslint"
    ],
    "globals": {
      "Atomics": "readonly",
      "SharedArrayBuffer": "readonly",
      "__DEV__": "readonly"
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
      "ecmaFeatures": {
        "jsx": true
      },
      "ecmaVersion": 2018,
      "sourceType": "module"
    },
    "plugins": ["react", "react-hooks", "@typescript-eslint", "prettier"],
    "rules": {
      "prettier/prettier": "error",
  
      "no-console": ["warn", { "allow": ["tron"] }],
      "spaced-comment": ["error", "always", { "markers": ["/"] }],
      "import/prefer-default-export": "off",
      "class-methods-use-this": "off",
      "no-unused-expressions": "off",
      "no-unused-vars": "off",
  
      // TypeScript
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-unused-expressions": "error",
  
      // React
      "react/jsx-props-no-spreading": "off",
      "react/jsx-filename-extension": [
        "warn",
        {
          "extensions": [".js", ".jsx", ".ts", ".tsx"]
        }
      ],
      "react/prop-types": "off",
  
      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
  
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          "js": "never",
          "jsx": "never",
          "ts": "never",
          "tsx": "never"
        }
      ]
    },
    "settings": {
      "import/resolver": {
        "node": {
          "paths": ["./src"]
        },
        "babel-module": {}
      }
    }
  }