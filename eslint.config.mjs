import js from "@eslint/js";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";
import compat from "eslint-plugin-compat";

export default defineConfig([
  globalIgnores(["spec/support/jasmine-browser.js"]),
  compat.configs["flat/recommended"],
  {
    files: ["**/*.js"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      sourceType: "script",
      globals: {
        ...globals.browser,
        ...globals.jasmine,
        getAjaxRequireObj: true
      }
    },
    rules: {
      "block-spacing": "error",
      curly: "error",
      "dot-notation": "error",
      eqeqeq: "error",
      "func-call-spacing": ["error", "never"],
      "key-spacing": "error",
      "no-caller": "error",
      "no-console": "error",
      "no-debugger": "error",
      "no-eq-null": "error",
      "no-eval": "error",
      "no-implicit-globals": "error",
      "no-tabs": "error",
      "no-trailing-spaces": "error",
      "no-undef": "error",
      "no-unused-vars": ["error", {
        args: "none",
      }],
      "no-use-before-define": ["error", { "functions": false }],
      "no-whitespace-before-property": "error",
      semi: ["error", "always"],
      "space-before-blocks": "error",
    }
  },
]);
