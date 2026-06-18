import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "import/no-default-export": "error",
      "no-var": "error",
      "prefer-const": "error",
      "import/no-duplicates": "error",
      "import/no-cycle": ["error", { maxDepth: 10 }],
      eqeqeq: ["error", "smart"],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "react/jsx-no-leaked-render": [
        "error",
        { validStrategies: ["coerce", "ternary"] },
      ],
      "react-hooks/exhaustive-deps": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          pathGroups: [
            { pattern: "@/**", group: "internal", position: "after" },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
  // Type-aware rules — need type information via the TS project service.
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/switch-exhaustiveness-check": [
        "error",
        { requireDefaultForNonUnion: true },
      ],
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
    },
  },
  // Vendored shadcn primitives — keep as the CLI generates them.
  {
    files: ["components/ui/**"],
    rules: {
      "import/no-default-export": "off",
      "import/order": "off",
      eqeqeq: "off",
      "react/jsx-no-leaked-render": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/prefer-optional-chain": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
    },
  },
  // Next.js framework files require default exports.
  {
    files: [
      "app/**/page.tsx",
      "app/**/layout.tsx",
      "app/**/loading.tsx",
      "app/**/error.tsx",
      "app/**/global-error.tsx",
      "app/**/not-found.tsx",
      "app/**/forbidden.tsx",
      "app/**/unauthorized.tsx",
      "app/**/template.tsx",
      "app/**/default.tsx",
      "app/**/route.ts",
      "app/**/opengraph-image.tsx",
      "app/**/icon.tsx",
      "app/**/apple-icon.tsx",
      "app/**/twitter-image.tsx",
      "app/sitemap.ts",
      "app/robots.ts",
      "app/manifest.ts",
      "proxy.ts",
      "middleware.ts",
      "*.config.{js,mjs,ts}",
    ],
    rules: {
      "import/no-default-export": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
