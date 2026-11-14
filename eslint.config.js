import js from "@eslint/js"
import globals from "globals"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import jsxA11y from "eslint-plugin-jsx-a11y"
import prettier from "eslint-config-prettier"

export default [
  { ignores: ["dist/", ".wrangler/", "coverage/"] },
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}", "test/**/*.{js,jsx}"],
    ...react.configs.flat.recommended,
    languageOptions: {
      ...react.configs.flat.recommended.languageOptions,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
    },
    settings: { react: { version: "detect" } },
  },
  {
    files: ["src/**/*.{js,jsx}", "test/**/*.{js,jsx}"],
    ...react.configs.flat["jsx-runtime"],
  },
  {
    files: ["src/**/*.{js,jsx}"],
    plugins: { "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Accessibility is linted on every commit, not just checked by hand.
      ...jsxA11y.flatConfigs.recommended.rules,
      "react/prop-types": "off",
    },
  },
  {
    files: ["worker/**/*.js", "test/worker-entry.js"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module", globals: globals.serviceworker },
  },
  { files: ["*.config.js", "scripts/**/*.mjs"], languageOptions: { globals: globals.node } },
  prettier,
]
